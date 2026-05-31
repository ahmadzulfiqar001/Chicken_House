import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRealtime } from "../lib/realtime";
import { Search, Clock, CheckCircle2, Truck, Utensils, AlertCircle, ChevronRight, MapPin, Star, ShieldCheck } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import PageMeta from "../components/layout/PageMeta";
import { siteConfig } from "../lib/site";

type TrackingOrder = {
  id: string;
  status: string;
  items: string;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus?: string;
  rating?: number;
  ratedAt?: string;
  feedback?: string;
  deliveryFee: number;
  estimatedArrival: string;
  timeline: Array<{ status: string; time: string; completed: boolean; active?: boolean }>;
  details?: Array<{ name: string; quantity: number; price: number }>;
};

const OrderTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") ?? "");
  const [isSearching, setIsSearching] = useState(false);
  const [orderData, setOrderData] = useState<TrackingOrder | null>(null);
  const [error, setError] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackBusy, setFeedbackBusy] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackDone, setFeedbackDone] = useState(false);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;

    setIsSearching(true);
    setError("");
    setOrderData(null);

    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(id.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Order not found.");
      }

      setOrderData(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Unable to fetch the order right now.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("orderId")) {
      void fetchOrder(searchParams.get("orderId") as string);
    }
  }, [searchParams]);

  // Live updates: refresh the tracked order in realtime as its status changes.
  useRealtime("orders", () => {
    if (orderData?.id) {
      void fetchOrder(orderData.id);
    }
  });

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    await fetchOrder(orderId);
  };

  const submitFeedback = async () => {
    if (!orderData || feedbackRating < 1) return;
    setFeedbackBusy(true);
    setFeedbackMessage("");
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(orderData.id)}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: feedbackRating, comment: feedbackComment }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Could not submit feedback.");
      setFeedbackDone(true);
      setFeedbackMessage("Thank you for your feedback!");
      await fetchOrder(orderData.id);
    } catch (err) {
      setFeedbackMessage(err instanceof Error ? err.message : "Could not submit feedback.");
    } finally {
      setFeedbackBusy(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock size={24} />;
      case "confirmed": return <CheckCircle2 size={24} />;
      case "preparing": return <Utensils size={24} />;
      case "out for delivery": return <Truck size={24} />;
      case "delivered": return <CheckCircle2 size={24} />;
      default: return <AlertCircle size={24} />;
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <PageMeta
        title="Track Order | Chicken House"
        description="Track your Chicken House order using the live order ID from checkout."
      />

      <section className="relative overflow-hidden bg-dark pb-12 pt-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-5xl font-display font-bold text-white md:text-7xl"
          >
            Track Your <span className="text-accent italic">Order</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-white/60"
          >
            Enter your order ID to check the live order progress and delivery details.
          </motion.p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent" />
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="group relative">
            <div className="absolute left-4 sm:left-6 top-7 sm:top-1/2 sm:-translate-y-1/2 text-muted transition-colors group-focus-within:text-primary">
              <Search size={22} />
            </div>
            <input
              type="text"
              placeholder="Enter your Order ID (e.g. ORD-1747070000000)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full rounded-full border-2 border-surface-strong bg-white py-4 sm:py-6 pl-14 sm:pl-16 pr-4 sm:pr-40 text-base sm:text-xl font-bold text-dark shadow-xl shadow-dark/5 outline-none transition-all focus:border-primary"
            />
            <button
              type="submit"
              disabled={!orderId || isSearching}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 font-bold text-white transition-colors hover:bg-primary-strong disabled:opacity-50 sm:absolute sm:bottom-3 sm:right-3 sm:top-3 sm:mt-0 sm:w-auto sm:py-0"
            >
              {isSearching ? <Clock size={20} className="animate-spin" /> : <>Track <ChevronRight size={20} /></>}
            </button>
          </form>
        </div>
      </section>

      <section className="pb-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            {error && !isSearching && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-[3rem] border border-red-100 bg-white p-12 text-center shadow-xl shadow-dark/5">
                <AlertCircle size={38} className="mx-auto text-red-500" />
                <h3 className="mt-5 text-2xl font-bold text-dark">Order not found</h3>
                <p className="mt-3 text-muted">{error}</p>
              </motion.div>
            )}

            {orderData ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 gap-12 lg:grid-cols-3"
              >
                {orderData.paymentStatus && orderData.paymentStatus !== "Unpaid" && (
                  <div
                    className={`flex items-start gap-4 rounded-[2rem] border p-6 lg:col-span-3 ${
                      orderData.paymentStatus === "Verified"
                        ? "border-green-200 bg-green-50 text-green-800"
                        : orderData.paymentStatus === "Rejected"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <ShieldCheck size={28} className="mt-1 shrink-0" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest">Payment {orderData.paymentStatus}</p>
                      <p className="mt-1 text-sm">
                        {orderData.paymentStatus === "Pending Verification"
                          ? "Please wait — your payment is being verified by our admin/manager team. This page updates automatically the moment it's confirmed."
                          : orderData.paymentStatus === "Verified"
                            ? "Your payment has been verified and your order is confirmed. Thank you!"
                            : "Your payment could not be verified, so this order was cancelled. Please contact us if this is a mistake."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-8 lg:col-span-2">
                  <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
                    <h2 className="mb-10 flex items-center gap-3 text-2xl font-bold text-dark">
                      <Clock className="text-primary" />
                      Order Status
                    </h2>

                    <div className="relative space-y-12">
                      <div className="absolute bottom-2 left-6 top-2 w-1 bg-surface-strong" />

                      {orderData.timeline.map((step) => (
                        <div key={step.status} className="relative z-10 flex items-start gap-8">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-all duration-500 ${step.active ? "scale-110 bg-primary text-white shadow-xl shadow-primary/30" : step.completed ? "bg-primary/20 text-primary" : "bg-surface-strong text-muted"}`}>
                            {getStatusIcon(step.status)}
                          </div>
                          <div className="flex-1 pt-2">
                            <div className="mb-1 flex items-center justify-between">
                              <h3 className={`text-xl font-bold ${step.active ? "text-primary" : "text-dark"}`}>
                                {step.status}
                              </h3>
                              <span className="text-sm font-medium text-muted">{step.time}</span>
                            </div>
                            {step.active && (
                              <p className="text-sm text-muted">
                                Your order is currently in progress and our team is handling it now.
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
                    <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-dark">
                      <Truck className="text-primary" />
                      Delivery Details
                    </h2>
                    <div className="flex items-start gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                        <MapPin size={24} />
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-bold text-dark">Delivery Address</h3>
                        <p className="text-lg text-muted">{orderData.deliveryAddress || siteConfig.city}</p>
                      </div>
                    </div>
                    <div className="mt-10 flex items-center justify-between rounded-3xl bg-surface-strong p-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary">
                          <Clock size={24} />
                        </div>
                        <div>
                          <span className="block text-sm font-bold uppercase tracking-widest text-muted">Estimated Arrival</span>
                          <span className="text-2xl font-display font-bold text-dark">{orderData.estimatedArrival}</span>
                        </div>
                      </div>
                      <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`} className="rounded-xl bg-primary px-8 py-3 font-bold text-white transition-colors hover:bg-primary-strong">
                        Call Restaurant
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="sticky top-32 rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
                    <h2 className="mb-4 text-2xl font-bold text-dark">Order Summary</h2>
                    <p className="mb-8 text-sm font-bold uppercase tracking-[0.24em] text-primary">{orderData.id}</p>
                    <div className="mb-8 space-y-4">
                      {(orderData.details?.length ? orderData.details : orderData.items.split(",").map((item) => ({ name: item.trim(), quantity: 1, price: 0 }))).map((item) => (
                        <div key={`${item.name}-${item.quantity}`} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-strong text-sm font-bold text-dark">
                              {item.quantity}x
                            </span>
                            <span className="font-medium text-muted">{item.name}</span>
                          </div>
                          <span className="font-bold text-dark">{item.price ? `Rs. ${item.price}` : ""}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4 border-t border-gray-100 pt-8">
                      <div className="flex justify-between text-muted">
                        <span>Subtotal</span>
                        <span>
                          Rs. {Math.max(orderData.total - orderData.deliveryFee, 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted">
                        <span>Delivery Fee</span>
                        <span>Rs. {orderData.deliveryFee.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-4">
                        <span className="text-xl font-bold text-dark">Total</span>
                        <span className="text-3xl font-display font-bold text-primary">
                          Rs. {orderData.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-8 rounded-[2rem] bg-surface p-5 text-sm text-muted">
                      Payment method: <span className="font-bold text-dark">{orderData.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                {orderData.status === "Delivered" && (
                  <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5 lg:col-span-3">
                    <h2 className="mb-2 flex items-center gap-3 text-2xl font-bold text-dark">
                      <Star className="text-accent" /> Rate your order
                    </h2>
                    {orderData.ratedAt || feedbackDone ? (
                      <p className="text-muted">
                        Thank you for your feedback
                        {(orderData.rating ?? feedbackRating)
                          ? ` — ${orderData.rating ?? feedbackRating}/5 stars`
                          : ""}
                        . We appreciate it!
                      </p>
                    ) : (
                      <>
                        <p className="mb-6 text-muted">Your order was delivered. How was your experience?</p>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} type="button" onClick={() => setFeedbackRating(n)} aria-label={`${n} star`}>
                              <Star
                                size={34}
                                className={n <= feedbackRating ? "fill-accent text-accent" : "text-surface-strong"}
                              />
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          placeholder="Share a few words about your order (optional)"
                          rows={3}
                          className="mt-6 w-full rounded-2xl border border-gray-200 bg-surface px-5 py-4 outline-none"
                        />
                        {feedbackMessage && (
                          <p className="mt-3 text-sm font-medium text-red-500">{feedbackMessage}</p>
                        )}
                        <button
                          type="button"
                          onClick={submitFeedback}
                          disabled={feedbackBusy || feedbackRating < 1}
                          className="mt-6 rounded-full bg-primary px-8 py-4 font-bold text-white transition hover:bg-primary-strong disabled:opacity-50"
                        >
                          {feedbackBusy ? "Submitting..." : "Submit Feedback"}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              !isSearching && !error && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center"
                >
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-surface text-muted">
                    <Search size={40} />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-dark">Enter your Order ID</h3>
                  <p className="text-muted">You can find your order ID on the checkout confirmation screen.</p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default OrderTrackingPage;
