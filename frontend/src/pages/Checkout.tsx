import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  MapPin,
  Phone,
  ReceiptText,
  ShoppingBag,
  Store,
  Truck,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { useToast } from "../components/layout/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { CartItem, useCart } from "../context/CartContext";
import {
  calculateDeliveryFee,
  estimateFulfillmentWindow,
  supportedDeliveryCities,
  validateCheckoutDetails,
} from "../lib/orderPricing";
import { siteConfig } from "../lib/site";

type CustomerProfileResponse = {
  profile: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
  };
};

type CheckoutConfirmation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  paymentMethod: string;
  paymentReference?: string;
  type: "Delivery" | "Takeaway";
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: CartItem[];
};

const paymentMethods = ["Cash on Delivery", "Easypaisa", "JazzCash", "Bank Transfer (HBL)"];
const isTransferMethod = (method: string) => !/cash/i.test(method);
const orderTypes = ["Delivery", "Takeaway"] as const;

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "");

const CheckoutPage = () => {
  const { user } = useAuth();
  const { cartItems, subtotal, clearCart } = useCart();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: "",
    city: "Renala Khurd",
    notes: "",
    paymentMethod: "Cash on Delivery",
    paymentReference: "",
    type: "Delivery" as "Delivery" | "Takeaway",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<CheckoutConfirmation | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/customer");
        if (!response.ok) return;

        const data = (await response.json()) as CustomerProfileResponse;
        setFormData((prev) => ({
          ...prev,
          name: data.profile.name || prev.name,
          email: data.profile.email || prev.email,
          phone: data.profile.phone || prev.phone,
          address: data.profile.address || prev.address,
          city: data.profile.city || prev.city,
        }));
      } catch (fetchError) {
        console.error(fetchError);
      }
    };

    void loadProfile();
  }, [user]);

  const deliveryFee = useMemo(
    () =>
      calculateDeliveryFee({
        orderType: formData.type,
        city: formData.city,
        address: formData.address,
        subtotal,
      }),
    [formData.address, formData.city, formData.type, subtotal],
  );

  const finalTotal = subtotal + deliveryFee;
  const validationError = validateCheckoutDetails({
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    paymentMethod: formData.paymentMethod,
    orderType: formData.type,
  });

  const fieldErrors = useMemo(
    () => ({
      name: formData.name.trim().length < 2 ? "Please enter the customer name." : "",
      email: formData.email.trim() && !formData.email.includes("@")
        ? "Please enter a valid email address."
        : "",
      phone:
        formData.phone.trim() && !/^\+?[0-9\s-]{10,16}$/.test(formData.phone.trim())
          ? "Please enter a valid phone number."
          : "",
      address:
        formData.type === "Delivery" && formData.address.trim().length > 0 && formData.address.trim().length < 8
          ? "Please enter a complete delivery address."
          : "",
    }),
    [formData.address, formData.email, formData.name, formData.phone, formData.type],
  );

  const showFieldErrors = submitAttempted || Boolean(error);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setError("");

    if (!cartItems.length) {
      const message = "Your cart is empty.";
      setError(message);
      showToast({
        tone: "error",
        title: "Cart is empty",
        description: "Add menu items before moving to checkout.",
      });
      return;
    }

    if (validationError) {
      setError(validationError);
      showToast({
        tone: "error",
        title: "Checkout details need attention",
        description: validationError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          type: formData.type,
          city: formData.city,
          paymentMethod: formData.paymentMethod,
          paymentReference: formData.paymentReference,
          deliveryAddress:
            formData.type === "Delivery"
              ? `${formData.address}, ${formData.city}`.trim()
              : "Takeaway Pickup",
          notes: formData.notes,
          details: cartItems.map((item) => ({
            menuItemId: item.menuItemId,
            name: item.name,
            category: item.category,
            variantLabel: item.variantLabel,
            quantity: item.quantity,
            price: item.price,
            image: item.image,
            customizations: item.customizations,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Checkout failed.");
      }

      const snapshot = cartItems.map((item) => ({ ...item }));
      setConfirmation({
        id: data.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.type === "Delivery" ? formData.address : "Takeaway Pickup",
        city: formData.city,
        notes: formData.notes,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference,
        type: formData.type,
        subtotal,
        deliveryFee,
        total: finalTotal,
        items: snapshot,
      });
      clearCart();
      showToast({
        tone: "success",
        title: "Order confirmed",
        description: `${data.id} has been placed successfully.`,
      });
    } catch (submitError) {
      console.error(submitError);
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to complete checkout right now.";
      setError(message);
      showToast({
        tone: "error",
        title: "Order could not be placed",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cartItems.length && !confirmation) {
    return (
      <div className="min-h-screen bg-paper pt-32">
        <PageMeta
          title="Checkout | Chicken House"
          description="Secure checkout for Chicken House delivery and takeaway orders."
        />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center">
          <div className="rounded-[3rem] border border-gray-100 bg-white p-16 shadow-xl shadow-dark/5">
            <ShoppingBag size={42} className="mx-auto text-primary" />
            <h1 className="mt-6 text-3xl font-bold text-dark">Your cart is empty</h1>
            <p className="mt-3 text-muted">Add some dishes before moving to checkout.</p>
            <Link
              to="/menu"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-white"
            >
              Explore Menu
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper pt-32">
      <PageMeta
        title="Checkout | Chicken House"
        description="Secure checkout for Chicken House delivery and takeaway orders."
      />

      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl font-display font-bold text-dark md:text-6xl">
              Complete Your <span className="text-primary italic">Order</span>
            </h1>
            <p className="mt-4 max-w-2xl text-muted">
              Confirm your contact details, delivery address, and payment method before we place the order.
            </p>
          </div>

          {confirmation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]"
            >
              <div className="rounded-[3rem] border border-green-100 bg-white p-10 shadow-xl shadow-dark/5">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 size={42} />
                </div>
                <h2 className="mt-8 text-4xl font-display font-bold text-dark">Order confirmed</h2>
                <p className="mt-4 text-lg text-muted">
                  Your order <span className="font-bold text-primary">{confirmation.id}</span> has been placed successfully.
                </p>

                {isTransferMethod(confirmation.paymentMethod) && (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
                    <p className="font-bold">Complete your {confirmation.paymentMethod} payment</p>
                    <p className="mt-1">
                      Send <span className="font-bold">Rs. {confirmation.total.toLocaleString()}</span> to the account
                      below and include your Order ID <span className="font-bold">{confirmation.id}</span> in the
                      transaction. Our team verifies it shortly and the status updates live on your tracking page.
                    </p>
                    <div className="mt-3 space-y-1">
                      {(siteConfig.bankAccounts.some((acct) => acct.method === confirmation.paymentMethod)
                        ? siteConfig.bankAccounts.filter((acct) => acct.method === confirmation.paymentMethod)
                        : siteConfig.bankAccounts
                      ).map((acct) => (
                        <p key={acct.accountNumber} className="font-bold text-dark">
                          {acct.bank}: <span className="font-mono">{acct.accountNumber}</span> ({acct.accountTitle})
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[2rem] bg-surface p-5 text-sm text-dark">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Order Type</p>
                    <p className="mt-2 font-bold">{confirmation.type}</p>
                  </div>
                  <div className="rounded-[2rem] bg-surface p-5 text-sm text-dark">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Payment</p>
                    <p className="mt-2 font-bold">{confirmation.paymentMethod}</p>
                  </div>
                  <div className="rounded-[2rem] bg-surface p-5 text-sm text-dark">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Contact</p>
                    <p className="mt-2 font-bold">{confirmation.phone}</p>
                  </div>
                  <div className="rounded-[2rem] bg-surface p-5 text-sm text-dark">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Estimated ETA</p>
                    <p className="mt-2 font-bold">{estimateFulfillmentWindow(confirmation.type)}</p>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    to={`/track?orderId=${confirmation.id}`}
                    className="rounded-full bg-primary px-8 py-4 font-bold text-white"
                  >
                    Track This Order
                  </Link>
                  <Link
                    to="/menu"
                    className="rounded-full border border-gray-200 bg-white px-8 py-4 font-bold text-dark"
                  >
                    Order More
                  </Link>
                </div>
              </div>

              <div className="rounded-[3rem] border border-gray-100 bg-white p-10 shadow-xl shadow-dark/5">
                <div className="flex items-center justify-between gap-6 border-b border-gray-100 pb-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Invoice</p>
                    <h3 className="mt-2 text-3xl font-display font-bold text-dark">{confirmation.id}</h3>
                  </div>
                  <ReceiptText size={34} className="text-primary" />
                </div>

                <div className="grid gap-5 border-b border-gray-100 py-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Customer</p>
                    <p className="mt-2 font-bold text-dark">{confirmation.name}</p>
                    <p className="text-sm text-muted">{confirmation.email}</p>
                    <p className="text-sm text-muted">{confirmation.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
                      {confirmation.type === "Delivery" ? "Delivery Address" : "Pickup"}
                    </p>
                    <p className="mt-2 font-bold text-dark">{confirmation.address}</p>
                    <p className="text-sm text-muted">{confirmation.city}</p>
                    {confirmation.notes ? (
                      <p className="mt-2 text-sm text-muted">Notes: {confirmation.notes}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4 py-6">
                  {confirmation.items.map((item) => (
                    <div
                      key={String(item.id)}
                      className="flex items-start justify-between gap-4 rounded-[1.8rem] bg-surface p-4"
                    >
                      <div className="flex items-start gap-4">
                        <img
                          src={item.image || "/restaurant-placeholder.svg"}
                          alt={item.name}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-dark">{item.name}</p>
                          <p className="text-sm text-muted">
                            {item.quantity} x Rs. {item.price.toLocaleString()}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                            {item.customizations?.variantLabel ? (
                              <span className="rounded-full bg-white px-3 py-1 font-medium text-dark">
                                {item.customizations.variantLabel}
                              </span>
                            ) : null}
                            {item.customizations?.spices ? (
                              <span className="rounded-full bg-white px-3 py-1 font-medium text-dark">
                                {item.customizations.spices}
                              </span>
                            ) : null}
                            {item.customizations?.drink ? (
                              <span className="rounded-full bg-white px-3 py-1 font-medium text-dark">
                                {item.customizations.drink}
                              </span>
                            ) : null}
                            {item.customizations?.chutney ? (
                              <span className="rounded-full bg-white px-3 py-1 font-medium text-dark">
                                {item.customizations.chutney}
                              </span>
                            ) : null}
                            {item.customizations?.extras?.map((extra) => (
                              <span key={extra} className="rounded-full bg-white px-3 py-1 font-medium text-dark">
                                {extra}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="font-bold text-dark">
                        Rs. {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-6">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal</span>
                    <span>Rs. {confirmation.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted">
                    <span>Delivery Fee</span>
                    <span>{confirmation.type === "Takeaway" ? "Free" : `Rs. ${confirmation.deliveryFee.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-dark">
                    <span>Total</span>
                    <span className="text-primary">Rs. {confirmation.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="rounded-[3rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5 md:p-10">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-dark">Customer details</h2>
                    <Link
                      to="/cart"
                      className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-5 py-3 text-sm font-bold text-dark"
                    >
                      <ArrowLeft size={16} />
                      Back to cart
                    </Link>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          className="w-full rounded-2xl bg-surface px-12 py-4 outline-none"
                          placeholder="Your full name"
                          autoComplete="name"
                        />
                      </div>
                      {showFieldErrors && fieldErrors.name ? (
                        <p className="text-sm text-red-600">{fieldErrors.name}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Email Address</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full rounded-2xl bg-surface px-12 py-4 outline-none"
                          placeholder={siteConfig.email}
                          autoComplete="email"
                        />
                      </div>
                      {showFieldErrors && fieldErrors.email ? (
                        <p className="text-sm text-red-600">{fieldErrors.email}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                        <input
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: normalizePhone(e.target.value) }))
                          }
                          className="w-full rounded-2xl bg-surface px-12 py-4 outline-none"
                          placeholder={siteConfig.phone}
                          autoComplete="tel"
                          inputMode="tel"
                        />
                      </div>
                      {showFieldErrors && fieldErrors.phone ? (
                        <p className="text-sm text-red-600">{fieldErrors.phone}</p>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-[3rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5 md:p-10">
                  <h2 className="text-2xl font-bold text-dark">Delivery & payment</h2>

                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {orderTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            type,
                            address: type === "Takeaway" ? "" : prev.address,
                          }))
                        }
                        className={`rounded-[2rem] border p-5 text-left transition ${
                          formData.type === type
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-gray-100 bg-surface"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-white p-3 text-primary shadow-sm">
                            {type === "Delivery" ? <Truck size={18} /> : <Store size={18} />}
                          </div>
                          <div>
                            <p className="font-bold text-dark">{type}</p>
                            <p className="text-sm text-muted">{estimateFulfillmentWindow(type)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Payment Method</label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                        className="w-full rounded-2xl bg-surface px-5 py-4 outline-none"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>

                    {isTransferMethod(formData.paymentMethod) ? (
                      <div className="space-y-3 rounded-2xl border border-accent/40 bg-accent/5 p-5 md:col-span-2">
                        <div className="flex items-center gap-2 text-sm font-bold text-dark">
                          <CreditCard size={18} className="text-accent" />
                          Send the order total to the account below to complete your {formData.paymentMethod} payment.
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {(siteConfig.bankAccounts.some((acct) => acct.method === formData.paymentMethod)
                            ? siteConfig.bankAccounts.filter((acct) => acct.method === formData.paymentMethod)
                            : siteConfig.bankAccounts
                          ).map((acct) => (
                            <div key={`${acct.bank}-${acct.accountNumber}`} className="rounded-xl bg-white p-4 text-sm shadow-sm">
                              <p className="font-bold text-dark">{acct.bank}</p>
                              <p className="text-muted">{acct.accountTitle}</p>
                              <p className="mt-1 font-mono text-lg font-bold text-dark">{acct.accountNumber}</p>
                              <p className="mt-1 text-xs font-medium text-primary">{acct.note}</p>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-xl bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
                          After you place the order you&apos;ll get an Order ID — include it in your payment so our team
                          can verify it. You&apos;ll see the status update live on your tracking page.
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                            Transaction ID (optional — if you have already paid)
                          </label>
                          <input
                            value={formData.paymentReference}
                            onChange={(e) => setFormData((prev) => ({ ...prev, paymentReference: e.target.value }))}
                            placeholder="e.g. your Easypaisa / JazzCash / bank transaction ID"
                            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 outline-none"
                          />
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">City</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                        className="w-full rounded-2xl bg-surface px-5 py-4 outline-none"
                      >
                        {supportedDeliveryCities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-6 text-muted" size={18} />
                        <textarea
                          value={formData.address}
                          onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                          rows={3}
                          disabled={formData.type === "Takeaway"}
                          className="w-full resize-none rounded-2xl bg-surface px-12 py-4 outline-none disabled:opacity-60"
                          placeholder={
                            formData.type === "Takeaway"
                              ? "Pickup orders do not require a delivery address"
                              : "House number, street, area"
                          }
                        />
                      </div>
                      {showFieldErrors && fieldErrors.address ? (
                        <p className="text-sm text-red-600">{fieldErrors.address}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Special Notes</label>
                      <input
                        value={formData.notes}
                        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value.slice(0, 120) }))}
                        className="w-full rounded-2xl bg-surface px-5 py-4 outline-none"
                        placeholder="Gate instructions, spice note, etc."
                      />
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/20 disabled:opacity-70"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                  <ArrowRight size={18} />
                </button>
              </form>

              <div className="space-y-8">
                <div className="sticky top-32 rounded-[3rem] border border-gray-100 bg-white p-8 shadow-xl shadow-dark/5">
                  <h2 className="text-2xl font-bold text-dark">Order summary</h2>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.8rem] bg-surface p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Items</p>
                      <p className="mt-2 text-2xl font-display font-bold text-dark">
                        {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                      </p>
                    </div>
                    <div className="rounded-[1.8rem] bg-surface p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">ETA</p>
                      <p className="mt-2 text-lg font-bold text-dark">
                        {estimateFulfillmentWindow(formData.type)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 space-y-5">
                    {cartItems.map((item) => (
                      <div key={String(item.id)} className="flex items-start gap-4">
                        <img
                          src={item.image || "/restaurant-placeholder.svg"}
                          alt={item.name}
                          className="h-20 w-20 rounded-2xl object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-dark">{item.name}</p>
                          <p className="text-sm text-muted">
                            {item.quantity} x Rs. {item.price.toLocaleString()}
                            {item.variantLabel ? ` • ${item.variantLabel}` : ""}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                            {item.customizations?.spices ? (
                              <span className="rounded-full bg-surface px-3 py-1 font-medium text-dark">
                                {item.customizations.spices}
                              </span>
                            ) : null}
                            {item.customizations?.drink ? (
                              <span className="rounded-full bg-surface px-3 py-1 font-medium text-dark">
                                {item.customizations.drink}
                              </span>
                            ) : null}
                            {item.customizations?.chutney ? (
                              <span className="rounded-full bg-surface px-3 py-1 font-medium text-dark">
                                {item.customizations.chutney}
                              </span>
                            ) : null}
                            {item.customizations?.extras?.map((extra) => (
                              <span key={extra} className="rounded-full bg-surface px-3 py-1 font-medium text-dark">
                                {extra}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="font-bold text-dark">
                          Rs. {(item.quantity * item.price).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
                    <div className="flex justify-between text-muted">
                      <span>Subtotal</span>
                      <span>Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Delivery Fee</span>
                      <span>{formData.type === "Takeaway" ? "Free" : `Rs. ${deliveryFee.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-dark">
                      <span>Total</span>
                      <span className="text-primary">Rs. {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4 rounded-[2rem] bg-surface p-5 text-sm text-muted">
                    <div className="flex items-start gap-3">
                      <Truck size={18} className="mt-0.5 text-primary" />
                      <p>
                        Delivery charges are recalculated from your city, order value, and order type before confirmation.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard size={18} className="mt-0.5 text-primary" />
                      <p>
                        Payment and contact details are validated before the order is sent to the backend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CheckoutPage;
