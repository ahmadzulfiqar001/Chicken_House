import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  CreditCard,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageMeta from "../components/PageMeta";
import { useToast } from "../components/ToastProvider";
import { useCart } from "../context/CartContext";
import {
  calculateDeliveryFee,
  estimateFulfillmentWindow,
  supportedDeliveryCities,
  type DeliveryMode,
} from "../lib/orderPricing";

const CartPage = () => {
  const { cartItems, setQuantity, updateQuantity, removeFromCart, clearCart, subtotal } = useCart();
  const { showToast } = useToast();
  const [orderType, setOrderType] = useState<DeliveryMode>("Delivery");
  const [city, setCity] = useState("Renala Khurd");
  const [addressHint, setAddressHint] = useState("");

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );
  const estimatedDeliveryFee = useMemo(
    () =>
      calculateDeliveryFee({
        orderType,
        city,
        address: addressHint,
        subtotal,
      }),
    [addressHint, city, orderType, subtotal],
  );
  const estimatedTotal = subtotal + estimatedDeliveryFee;

  const handleRemove = (id: string | number, name: string) => {
    removeFromCart(id);
    showToast({
      tone: "info",
      title: "Item removed",
      description: `${name} has been removed from your cart.`,
    });
  };

  const handleClearCart = () => {
    clearCart();
    showToast({
      tone: "info",
      title: "Cart cleared",
      description: "Your order basket has been reset.",
    });
  };

  return (
    <div className="min-h-screen bg-paper">
      <PageMeta
        title="Cart | Chicken House"
        description="Review your Chicken House cart, update quantities, preview delivery charges, and move to secure checkout."
      />

      <section className="pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-display font-bold text-dark md:text-6xl"
            >
              Your <span className="text-primary italic">Cart</span>
            </motion.h1>

            {cartItems.length > 0 ? (
              <button
                type="button"
                onClick={handleClearCart}
                className="inline-flex items-center gap-2 self-start rounded-full border border-red-200 bg-white px-6 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={16} />
                Clear Cart
              </button>
            ) : null}
          </div>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-xl shadow-dark/5">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Items</p>
                    <p className="mt-3 text-3xl font-display font-bold text-dark">{totalItems}</p>
                  </div>
                  <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-xl shadow-dark/5">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Subtotal</p>
                    <p className="mt-3 text-3xl font-display font-bold text-dark">
                      Rs. {subtotal.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-xl shadow-dark/5">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Estimated ETA</p>
                    <p className="mt-3 text-lg font-bold text-dark">{estimateFulfillmentWindow(orderType)}</p>
                  </div>
                </div>

                <AnimatePresence mode="popLayout">
                  {cartItems.map((item) => (
                    <motion.div
                      key={String(item.id)}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="rounded-[2.5rem] border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5"
                    >
                      <div className="flex flex-col gap-6 sm:flex-row">
                        <div className="h-32 w-full overflow-hidden rounded-3xl sm:w-32 sm:shrink-0">
                          <img
                            src={item.image || "/restaurant-placeholder.svg"}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(event) => {
                              event.currentTarget.src = "/restaurant-placeholder.svg";
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-dark">{item.name}</h3>
                              <p className="mt-1 text-sm text-muted">{item.category}</p>

                              {item.customizations ? (
                                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                                  {item.customizations.variantLabel ? (
                                    <span className="rounded-full bg-surface px-3 py-2 font-medium text-dark">
                                      {item.customizations.variantLabel}
                                    </span>
                                  ) : null}
                                  {item.customizations.spices ? (
                                    <span className="rounded-full bg-surface px-3 py-2 font-medium text-dark">
                                      {item.customizations.spices}
                                    </span>
                                  ) : null}
                                  {item.customizations.drink ? (
                                    <span className="rounded-full bg-surface px-3 py-2 font-medium text-dark">
                                      {item.customizations.drink}
                                    </span>
                                  ) : null}
                                  {item.customizations.chutney ? (
                                    <span className="rounded-full bg-surface px-3 py-2 font-medium text-dark">
                                      {item.customizations.chutney}
                                    </span>
                                  ) : null}
                                  {item.customizations.extras?.map((extra) => (
                                    <span
                                      key={extra}
                                      className="rounded-full bg-surface px-3 py-2 font-medium text-dark"
                                    >
                                      {extra}
                                    </span>
                                  ))}
                                </div>
                              ) : null}

                              {item.customizations?.instructions ? (
                                <p className="mt-3 text-xs italic text-muted">
                                  "{item.customizations.instructions}"
                                </p>
                              ) : null}
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-sm uppercase tracking-[0.18em] text-muted">Line total</p>
                              <p className="mt-2 text-2xl font-display font-bold text-dark">
                                Rs. {(item.price * item.quantity).toLocaleString()}
                              </p>
                              <p className="mt-1 text-sm font-bold text-primary">
                                Rs. {item.price.toLocaleString()} each
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, -1)}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-dark transition hover:bg-primary hover:text-white"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <Minus size={18} />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={20}
                                value={item.quantity}
                                onChange={(event) =>
                                  setQuantity(item.id, Number(event.target.value || 1))
                                }
                                className="h-11 w-20 rounded-2xl border border-gray-100 bg-white px-3 text-center font-bold text-dark outline-none"
                                aria-label={`Quantity of ${item.name}`}
                              />
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, 1)}
                                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-dark transition hover:bg-primary hover:text-white"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <Plus size={18} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemove(item.id, item.name)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-red-500/10 px-5 py-3 font-bold text-red-500 transition hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 size={18} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="space-y-8">
                <div className="sticky top-32 rounded-[3rem] border border-gray-50 bg-white p-8 shadow-2xl shadow-dark/5">
                  <h2 className="text-2xl font-bold text-dark">Order Summary</h2>

                  <div className="mt-8 grid gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      {(["Delivery", "Takeaway"] as DeliveryMode[]).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setOrderType(mode)}
                          className={`rounded-2xl px-4 py-4 text-sm font-bold transition ${
                            orderType === mode
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "bg-surface text-dark"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>

                    <select
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      className="w-full rounded-2xl border border-gray-100 bg-surface px-5 py-4 outline-none"
                    >
                      {supportedDeliveryCities.map((supportedCity) => (
                        <option key={supportedCity} value={supportedCity}>
                          {supportedCity}
                        </option>
                      ))}
                    </select>

                    {orderType === "Delivery" ? (
                      <input
                        value={addressHint}
                        onChange={(event) => setAddressHint(event.target.value)}
                        className="w-full rounded-2xl border border-gray-100 bg-surface px-5 py-4 outline-none"
                        placeholder="Area or landmark for delivery estimate"
                      />
                    ) : null}
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between text-muted">
                      <span>Subtotal</span>
                      <span className="font-bold text-dark">Rs. {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>{orderType === "Takeaway" ? "Pickup Fee" : "Estimated Delivery Fee"}</span>
                      <span className="font-bold text-dark">
                        {orderType === "Takeaway"
                          ? "Free"
                          : `Rs. ${estimatedDeliveryFee.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                      <span className="text-xl font-bold text-dark">Estimated Total</span>
                      <span className="text-3xl font-display font-bold text-primary">
                        Rs. {estimatedTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        {orderType === "Delivery" ? <Truck size={20} /> : <Store size={20} />}
                      </div>
                      <div className="flex-1">
                        <span className="block text-xs font-bold uppercase tracking-widest text-muted">
                          Fulfillment
                        </span>
                        <span className="block text-sm font-bold text-dark">
                          {estimateFulfillmentWindow(orderType)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="block text-xs font-bold uppercase tracking-widest text-muted">Coverage</span>
                        <span className="block text-sm font-bold text-dark">
                          Renala Khurd, Mitchell&apos;s Area, Okara
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 rounded-2xl bg-surface p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                        <CreditCard size={20} />
                      </div>
                      <div className="flex-1">
                        <span className="block text-xs font-bold uppercase tracking-widest text-muted">Checkout</span>
                        <span className="block text-sm font-bold text-dark">
                          Customer details, payment method, and confirmation invoice
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/checkout"
                    className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-5 text-lg font-bold text-white shadow-2xl shadow-primary/20 transition-colors hover:bg-primary-strong"
                  >
                    Proceed to Checkout
                    <ChevronRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[3rem] border border-gray-50 bg-white py-32 text-center shadow-xl shadow-dark/5"
            >
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-surface text-muted">
                <ShoppingCart size={40} />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-dark">Your cart is empty</h2>
              <p className="mx-auto mb-10 max-w-sm text-muted">
                Looks like you haven&apos;t added anything yet. Explore the menu and build your order.
              </p>
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 font-bold text-white transition-colors hover:bg-primary-strong"
              >
                Go to Menu
                <ChevronRight size={20} />
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CartPage;
