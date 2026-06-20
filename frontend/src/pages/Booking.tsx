import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Phone,
  Star,
  Users,
} from "lucide-react";
import PageMeta from "../components/layout/PageMeta";
import SeatingMap from "../components/marketing/SeatingMap";
import { useToast } from "../components/layout/ToastProvider";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  bookingHeroImage,
  bookingStatuses,
  bookingStatusStyles,
  bookingTimeSlots,
  eventTypes,
  formatBookingTime,
  getEventTypeLabel,
  getPackageLabel,
  getPackagePrice,
  getZoneCapacity,
  getZoneLabel,
  guestPresets,
  menuPackages,
  zones,
} from "../lib/booking";
import { siteConfig } from "../lib/site";

const totalSteps = 4;

const todayString = new Date().toISOString().slice(0, 10);

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, "");

const BookingPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [bookingStatus, setBookingStatus] = useState<typeof bookingStatuses[number]>("Pending");
  const [formData, setFormData] = useState({
    eventType: "",
    zone: "",
    tableId: 0,
    tableCapacity: 0,
    guests: "",
    package: "",
    date: "",
    time: "",
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    specialRequests: "",
  });

  const selectedEvent = eventTypes.find((item) => item.id === formData.eventType);
  const selectedZone = zones.find((item) => item.id === formData.zone);
  const selectedPackage = menuPackages.find((item) => item.id === formData.package);
  const guests = Number(formData.guests || 0);
  const estimatedQuote =
    formData.package && Number.isFinite(guests) && guests > 0 ? getPackagePrice(formData.package) * guests : 0;

  const validateStep = (currentStep: number) => {
    if (currentStep === 1 && !formData.eventType) {
      return "Please select an event type first.";
    }

    if (currentStep === 2) {
      if (!formData.zone) {
        return "Please choose a venue zone.";
      }

      if (!Number.isFinite(guests) || guests < 1) {
        return "Please enter the expected number of guests.";
      }

      const capacity = formData.tableCapacity || getZoneCapacity(formData.zone);
      if (capacity && guests > capacity) {
        return `Guest count exceeds the selected ${formData.tableId ? "table" : "zone"} capacity of ${capacity}.`;
      }
    }

    if (currentStep === 3 && !formData.package) {
      return "Please choose a menu package.";
    }

    if (currentStep === 4) {
      if (!formData.date || !formData.time) {
        return "Please choose a booking date and time.";
      }

      const bookingMoment = new Date(`${formData.date}T${formData.time}:00`);
      if (Number.isNaN(bookingMoment.getTime()) || bookingMoment.getTime() < Date.now() - 5 * 60 * 1000) {
        return "Please choose a future booking time.";
      }

      if (formData.name.trim().length < 2) {
        return "Please enter your full name.";
      }

      if (!formData.email.includes("@")) {
        return "Please enter a valid email address.";
      }

      if (!/^\+?[0-9\s-]{10,16}$/.test(formData.phone.trim())) {
        return "Please enter a valid contact number.";
      }
    }

    return "";
  };

  const handleNext = () => {
    const validationError = validateStep(step);
    setError(validationError);

    if (validationError) {
      showToast({
        tone: "error",
        title: "Booking details missing",
        description: validationError,
      });
      return;
    }

    setStep((current) => Math.min(totalSteps, current + 1));
  };

  const handleBack = () => {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  };

  const handleSummaryStepChange = (targetStep: number) => {
    setError("");
    setStep(targetStep);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationError = validateStep(4);
    setError(validationError);

    if (validationError) {
      showToast({
        tone: "error",
        title: "Booking could not be submitted",
        description: validationError,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          eventType: formData.eventType,
          zone: formData.zone,
          tableId: formData.tableId,
          guests: Number(formData.guests),
          package: formData.package,
          date: formData.date,
          time: formData.time,
          specialRequests: formData.specialRequests,
          source: "booking-page",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Booking request failed.");
      }

      setBookingId(data.id);
      setBookingStatus(data.status ?? "Pending");
      setStep(5);
      showToast({
        tone: "success",
        title: "Booking received",
        description: `${data.id} is now visible in the admin booking queue.`,
      });
    } catch (submitError) {
      console.error(submitError);
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your booking right now.";
      setError(message);
      showToast({
        tone: "error",
        title: "Booking request failed",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.min(((step - 1) / totalSteps) * 100, 100);

  const summaryRows = useMemo(
    () => [
      { label: "Event", value: formData.eventType ? getEventTypeLabel(formData.eventType) : "Select event", step: 1 },
      {
        label: "Venue",
        value: formData.zone
          ? `${getZoneLabel(formData.zone)}${formData.tableId ? ` / Table ${formData.tableId}` : ""}`
          : "Select zone",
        step: 2,
      },
      { label: "Guests", value: formData.guests || "Add guests", step: 2 },
      { label: "Package", value: formData.package ? getPackageLabel(formData.package) : "Select package", step: 3 },
      {
        label: "Schedule",
        value:
          formData.date && formData.time
            ? `${formData.date} • ${formatBookingTime(formData.time)}`
            : "Choose date & time",
        step: 4,
      },
    ],
    [formData.date, formData.eventType, formData.guests, formData.package, formData.tableId, formData.time, formData.zone],
  );

  return (
    <div className="min-h-screen bg-paper">
      <PageMeta
        title="Book a Table | Chicken House"
        description="Book your Chicken House table or event space in Renala Khurd with a polished live booking form and admin queue submission."
      />

      <section className="relative overflow-hidden bg-dark pb-14 pt-32">
        <div className="absolute inset-0">
          <img
            src={bookingHeroImage}
            alt="Chicken House event booking setup"
            className="h-full w-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-dark/75 to-dark" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-center mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-3xl font-display font-bold text-white sm:text-5xl md:text-7xl"
            >
              Book Your <span className="block text-accent italic sm:inline">Special Event</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mx-auto max-w-[18rem] text-sm leading-6 text-white/70 sm:max-w-2xl sm:text-lg sm:leading-normal"
            >
              Reserve a table or event setup with a polished booking workflow, clear confirmation, and direct admin visibility.
            </motion.p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">Admin Visibility</p>
              <p className="mt-3 text-lg font-bold text-white">Instant booking queue sync</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">Event Friendly</p>
              <p className="mt-3 text-lg font-bold text-white">Wedding, birthday, corporate & more</p>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/5 px-6 py-5 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/50">Curated References</p>
              <p className="mt-3 text-lg font-bold text-white">Garden, rooftop, and banquet inspiration</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div className="overflow-hidden rounded-[3rem] border border-gray-50 bg-white shadow-2xl shadow-dark/5">
            <div className="border-b border-gray-100 px-5 py-6 sm:px-8 md:px-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                    Step {Math.min(step, totalSteps)} of {totalSteps}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold text-dark">
                    {step === 1 && "Choose the Occasion"}
                    {step === 2 && "Venue & Guest Count"}
                    {step === 3 && "Menu Package"}
                    {step === 4 && "Final Booking Details"}
                    {step === 5 && "Booking Confirmation"}
                  </h2>
                </div>
                {step < 5 ? (
                  <div className="rounded-full bg-surface px-5 py-3 text-sm font-bold text-dark">
                    {Math.round(progressPercent)}%
                  </div>
                ) : null}
              </div>

              {step < 5 ? (
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-strong">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              ) : null}
            </div>

            <div className="p-5 sm:p-8 md:p-12">
              {error ? (
                <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
                  {error}
                </div>
              ) : null}

              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <p className="text-muted">
                      Choose the type of event so we can tailor the venue, package, and follow-up correctly.
                    </p>

                    <div className="grid gap-6 md:grid-cols-2">
                      {eventTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData((current) => ({ ...current, eventType: type.id }))}
                          className={`overflow-hidden rounded-[2rem] border-2 text-left transition-all ${
                            formData.eventType === type.id
                              ? "border-primary shadow-xl shadow-primary/10"
                              : "border-gray-100 hover:border-primary/30"
                          }`}
                        >
                          <div className="h-40 overflow-hidden">
                            <img
                              src={type.image}
                              alt={type.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${type.color}`}>
                                <type.icon size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-dark">{type.name}</h3>
                                <p className="text-sm text-muted">{type.summary}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex justify-stretch pt-4 sm:justify-end">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 font-bold text-white shadow-xl shadow-primary/20 transition-colors hover:bg-primary-strong sm:w-auto"
                      >
                        Continue
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ) : null}

                {step === 2 ? (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                  >
                    <p className="text-muted">
                      Pick the venue zone and expected guest count. Capacities are checked before submission.
                    </p>

                    <SeatingMap
                      selectedTableId={formData.tableId}
                      date={formData.date}
                      time={formData.time}
                      onSelectTable={(table) =>
                        setFormData((current) => ({
                          ...current,
                          zone: table.zoneId,
                          tableId: table.id,
                          tableCapacity: table.capacity,
                          guests:
                            current.guests && Number(current.guests) > table.capacity
                              ? String(table.capacity)
                              : current.guests,
                        }))
                      }
                    />

                    <div className="grid gap-6 md:grid-cols-3">
                      {zones.map((zone) => (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() =>
                            setFormData((current) => ({
                              ...current,
                              zone: zone.id,
                              tableId: 0,
                              tableCapacity: 0,
                            }))
                          }
                          className={`overflow-hidden rounded-[2rem] border-2 text-left transition-all ${
                            formData.zone === zone.id
                              ? "border-primary shadow-xl shadow-primary/10"
                              : "border-gray-100 hover:border-primary/30"
                          }`}
                        >
                          <div className="h-40 overflow-hidden">
                            <img
                              src={zone.image}
                              alt={zone.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface text-primary">
                                <MapPin size={18} />
                              </div>
                              <div>
                                <h3 className="font-bold text-dark">{zone.name}</h3>
                                <p className="text-xs text-muted">Up to {zone.capacity} guests</p>
                              </div>
                            </div>
                            <p className="mt-4 text-sm leading-7 text-muted">{zone.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-dark">
                          Number of Guests
                        </label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                          <input
                            type="number"
                            placeholder="e.g. 50"
                            min="1"
                            max={formData.tableCapacity || selectedZone?.capacity || 200}
                            value={formData.guests}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, guests: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-transparent bg-surface py-4 pl-12 pr-6 outline-none transition-all focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-dark">
                          Quick Presets
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {guestPresets.map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() =>
                                setFormData((current) => ({ ...current, guests: String(preset) }))
                              }
                              className={`rounded-full px-4 py-3 text-sm font-bold transition ${
                                Number(formData.guests) === preset
                                  ? "bg-dark text-white"
                                  : "bg-surface text-dark hover:bg-surface-strong"
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-8 py-4 font-bold text-dark sm:w-auto"
                      >
                        <ChevronLeft size={18} />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 font-bold text-white shadow-xl shadow-primary/20 transition-colors hover:bg-primary-strong sm:w-auto"
                      >
                        Continue
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ) : null}

                {step === 3 ? (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <p className="text-muted">
                      Select the catering package. Estimated quote updates based on package and guest count.
                    </p>

                    <div className="grid gap-6 md:grid-cols-3">
                      {menuPackages.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setFormData((current) => ({ ...current, package: pkg.id }))}
                          className={`flex flex-col justify-between rounded-[2rem] border-2 p-6 text-left transition-all ${
                            formData.package === pkg.id
                              ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                              : "border-gray-100 hover:border-primary/30"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-4">
                              <h3 className="text-xl font-bold text-dark">{pkg.name}</h3>
                              <Star size={18} className="text-accent" />
                            </div>
                            <p className="mt-2 text-3xl font-display font-bold text-primary">
                              Rs. {pkg.pricePerHead.toLocaleString()}
                            </p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-muted">
                              Per Head
                            </p>
                            <p className="mt-4 text-sm text-muted">{pkg.highlight}</p>
                            <div className="mt-5 space-y-2">
                              {pkg.items.map((item) => (
                                <div key={item} className="flex items-center gap-2 text-sm text-dark">
                                  <CheckCircle2 size={14} className="text-green-500" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-8 py-4 font-bold text-dark sm:w-auto"
                      >
                        <ChevronLeft size={18} />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 font-bold text-white shadow-xl shadow-primary/20 transition-colors hover:bg-primary-strong sm:w-auto"
                      >
                        Continue
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ) : null}

                {step === 4 ? (
                  <motion.div
                    key="step-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <p className="text-muted">
                      Finalize date, time, and contact details. Once submitted, your booking goes straight into the admin ERP queue.
                    </p>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-dark">Date</label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                              type="date"
                              min={todayString}
                              value={formData.date}
                              onChange={(event) =>
                                setFormData((current) => ({ ...current, date: event.target.value }))
                              }
                              className="w-full rounded-2xl border border-transparent bg-surface py-4 pl-12 pr-6 outline-none transition-all focus:border-primary"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-dark">Time</label>
                          <div className="relative">
                            <Clock3 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <select
                              value={formData.time}
                              onChange={(event) =>
                                setFormData((current) => ({ ...current, time: event.target.value }))
                              }
                              className="w-full rounded-2xl border border-transparent bg-surface py-4 pl-12 pr-6 outline-none transition-all focus:border-primary"
                            >
                              <option value="">Select time slot</option>
                              {bookingTimeSlots.map((slot) => (
                                <option key={slot} value={slot}>
                                  {formatBookingTime(slot)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-dark">Full Name</label>
                        <input
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, name: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-transparent bg-surface px-6 py-4 outline-none transition-all focus:border-primary"
                        />
                      </div>

                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-dark">Email</label>
                          <input
                            type="email"
                            placeholder={siteConfig.email}
                            value={formData.email}
                            onChange={(event) =>
                              setFormData((current) => ({ ...current, email: event.target.value }))
                            }
                            className="w-full rounded-2xl border border-transparent bg-surface px-6 py-4 outline-none transition-all focus:border-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-bold uppercase tracking-widest text-dark">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                              type="tel"
                              placeholder={siteConfig.phone}
                              value={formData.phone}
                              onChange={(event) =>
                                setFormData((current) => ({
                                  ...current,
                                  phone: normalizePhone(event.target.value),
                                }))
                              }
                              className="w-full rounded-2xl border border-transparent bg-surface py-4 pl-12 pr-6 outline-none transition-all focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-dark">Special Requests</label>
                        <textarea
                          rows={4}
                          placeholder="Any decorations, timing notes, menu preferences, or setup requests?"
                          value={formData.specialRequests}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              specialRequests: event.target.value.slice(0, 240),
                            }))
                          }
                          className="w-full resize-none rounded-2xl border border-transparent bg-surface px-6 py-4 outline-none transition-all focus:border-primary"
                        />
                      </div>

                      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 px-8 py-4 font-bold text-dark sm:w-auto"
                        >
                          <ChevronLeft size={18} />
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-10 py-4 font-bold text-white shadow-xl shadow-primary/20 transition-colors hover:bg-primary-strong disabled:opacity-70 sm:w-auto"
                        >
                          {isSubmitting ? "Submitting..." : "Confirm Booking"}
                          <CheckCircle2 size={20} />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                ) : null}

                {step === 5 ? (
                  <motion.div
                    key="step-5"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8 py-8 text-center"
                  >
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/20">
                      <CheckCircle2 size={48} />
                    </div>
                    <div>
                      <h2 className="mb-4 text-4xl font-display font-bold text-dark">Booking received</h2>
                      <p className="mx-auto max-w-2xl text-lg text-muted">
                        Thank you, <span className="font-bold text-primary">{formData.name}</span>. Your booking request{" "}
                        <span className="font-bold text-primary">{bookingId}</span> has been saved with status{" "}
                        <span className="font-bold text-primary">{bookingStatus}</span>, and it is now visible inside the admin booking queue.
                      </p>
                    </div>

                    <div className="mx-auto grid max-w-3xl gap-4 md:grid-cols-3">
                      <div className="rounded-[2rem] bg-surface p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Status</p>
                        <span
                          className={`mt-3 inline-flex rounded-full px-4 py-2 text-sm font-bold ${bookingStatusStyles[bookingStatus]}`}
                        >
                          {bookingStatus}
                        </span>
                      </div>
                      <div className="rounded-[2rem] bg-surface p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Venue</p>
                        <p className="mt-3 font-bold text-dark">
                          {getZoneLabel(formData.zone)}
                          {formData.tableId ? ` / Table ${formData.tableId}` : ""}
                        </p>
                      </div>
                      <div className="rounded-[2rem] bg-surface p-5">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Guests</p>
                        <p className="mt-3 font-bold text-dark">{formData.guests}</p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                      <Link
                        to="/"
                        className="inline-flex justify-center rounded-full bg-dark px-10 py-4 font-bold text-white transition-colors hover:bg-primary"
                      >
                        Back to Home
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setStep(1);
                          setError("");
                          setBookingId("");
                          setBookingStatus("Pending");
                          setFormData({
                            eventType: "",
                            zone: "",
                            tableId: 0,
                            tableCapacity: 0,
                            guests: "",
                            package: "",
                            date: "",
                            time: "",
                            name: user?.name ?? "",
                            email: user?.email ?? "",
                            phone: user?.phone ?? "",
                            specialRequests: "",
                          });
                        }}
                        className="rounded-full border border-gray-200 bg-white px-10 py-4 font-bold text-dark"
                      >
                        Make Another Booking
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6 lg:top-28">
              <div className="rounded-[3rem] border border-gray-50 bg-white p-8 shadow-2xl shadow-dark/5">
                <h3 className="text-2xl font-bold text-dark">Booking Summary</h3>
                <div className="mt-6 space-y-4">
                  {summaryRows.map((row) => (
                    <button
                      key={row.label}
                      type="button"
                      onClick={() => handleSummaryStepChange(row.step)}
                      className="flex w-full flex-col gap-2 rounded-2xl bg-surface p-4 text-left transition hover:bg-surface-strong focus:outline-none focus:ring-2 focus:ring-primary/25 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                    >
                      <span className="text-sm font-bold uppercase tracking-widest text-muted">{row.label}</span>
                      <span className="font-bold text-dark sm:max-w-[65%] sm:text-right">{row.value}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-[2rem] bg-dark p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/60">Estimated Quote</p>
                  <p className="mt-3 text-4xl font-display font-bold">
                    Rs. {estimatedQuote.toLocaleString()}
                  </p>
                  <p className="mt-3 text-sm text-white/70">
                    Based on selected package and guest count. Final quote may adjust after admin review.
                  </p>
                </div>
              </div>

            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default BookingPage;
