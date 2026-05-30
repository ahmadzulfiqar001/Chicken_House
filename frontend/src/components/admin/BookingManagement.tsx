import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useRealtime } from "../../lib/realtime";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Users,
  XCircle,
  List,
  CalendarDays,
} from "lucide-react";
import {
  bookingStatuses,
  bookingStatusStyles,
  formatBookingTime,
  getEventTypeLabel,
  getPackageLabel,
  getZoneLabel,
  type BookingStatus,
} from "../../lib/booking";
import BookingCalendar from "./BookingCalendar";

type BookingRecord = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  eventType: string;
  zone: string;
  guests: number;
  package: string;
  date: string;
  time: string;
  source: string;
  status: BookingStatus;
  specialRequests: string;
  branchId: string;
  quotedPrice: number;
  internalNotes?: string;
  assignedTo?: string;
  createdAt?: string;
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">("All");
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const query = statusFilter === "All" ? "" : `?status=${encodeURIComponent(statusFilter)}`;
      const response = await fetch(`/api/bookings${query}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to load bookings.");
      }

      setBookings(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Bookings could not be loaded right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchBookings();
  }, [statusFilter]);

  // Live updates: refetch when any booking changes (new reservation, status change).
  useRealtime("bookings", () => {
    void fetchBookings();
  });

  const filteredBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        [
          booking.id,
          booking.customerName,
          booking.customerEmail,
          booking.customerPhone,
          getEventTypeLabel(booking.eventType),
          getZoneLabel(booking.zone),
          getPackageLabel(booking.package),
          booking.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [bookings, searchQuery],
  );

  const stats = useMemo(() => {
    const pending = bookings.filter((item) => item.status === "Pending").length;
    const confirmed = bookings.filter((item) => item.status === "Confirmed").length;
    const completed = bookings.filter((item) => item.status === "Completed").length;
    const guests = bookings.reduce((sum, item) => sum + Number(item.guests ?? 0), 0);
    return { pending, confirmed, completed, guests };
  }, [bookings]);

  const updateStatus = async (booking: BookingRecord, status: BookingStatus) => {
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to update booking.");
      }

      await fetchBookings();
      setSelectedBooking(data);
    } catch (statusError) {
      console.error(statusError);
      setError("Booking status could not be updated.");
    }
  };

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {selectedBooking ? (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative w-full max-w-4xl overflow-hidden rounded-[3rem] bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 p-8">
                <div>
                  <h2 className="text-2xl font-bold text-dark">Booking Details</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    {selectedBooking.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-muted transition hover:bg-red-500 hover:text-white"
                >
                  <XCircle size={22} />
                </button>
              </div>

              <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div className="rounded-[2rem] bg-surface p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Customer</p>
                    <h3 className="mt-2 text-xl font-bold text-dark">{selectedBooking.customerName}</h3>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Email</p>
                        <p className="mt-2 text-sm font-bold text-dark">{selectedBooking.customerEmail}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Phone</p>
                        <p className="mt-2 text-sm font-bold text-dark">{selectedBooking.customerPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-surface p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Booking Summary</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Event</p>
                        <p className="mt-2 font-bold text-dark">{getEventTypeLabel(selectedBooking.eventType)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Zone</p>
                        <p className="mt-2 font-bold text-dark">{getZoneLabel(selectedBooking.zone)}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Guests</p>
                        <p className="mt-2 font-bold text-dark">{selectedBooking.guests}</p>
                      </div>
                      <div className="rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Package</p>
                        <p className="mt-2 font-bold text-dark">{getPackageLabel(selectedBooking.package)}</p>
                      </div>
                    </div>
                    {selectedBooking.specialRequests ? (
                      <div className="mt-4 rounded-2xl bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-muted">Special Requests</p>
                        <p className="mt-2 text-sm leading-7 text-dark">{selectedBooking.specialRequests}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[2rem] bg-surface-strong p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Estimated Quote</p>
                    <p className="mt-2 text-4xl font-display font-bold text-primary">
                      Rs. {Number(selectedBooking.quotedPrice ?? 0).toLocaleString()}
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-muted">
                      <p>{selectedBooking.date}</p>
                      <p>{formatBookingTime(selectedBooking.time)}</p>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-surface p-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Quick Status</p>
                    <div className="mt-4 grid gap-3">
                      {bookingStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(selectedBooking, status)}
                          className={`rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                            selectedBooking.status === status
                              ? "bg-primary text-white"
                              : "bg-white text-dark hover:bg-primary/10"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Calendar size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Total Bookings</p>
          <p className="text-2xl font-display font-bold text-dark">{bookings.length}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-500">
            <Clock3 size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Pending</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.pending}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
            <CheckCircle2 size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Confirmed</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.confirmed}</p>
        </div>
        <div className="rounded-3xl border border-gray-50 bg-white p-6 shadow-xl shadow-dark/5">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
            <Users size={24} />
          </div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-muted">Guest Volume</p>
          <p className="text-2xl font-display font-bold text-dark">{stats.guests}</p>
        </div>
      </div>

      <div className="rounded-[3rem] border border-gray-50 bg-white p-10 shadow-xl shadow-dark/5">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark">Booking Management</h2>
            <p className="mt-1 text-sm text-muted">
              Review customer booking requests, update status, and follow up with event details.
            </p>
          </div>

          <div className="flex w-full flex-wrap gap-4 md:w-auto">
            {/* View Toggle */}
            <div className="flex rounded-xl bg-surface p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  viewMode === "list" ? "bg-primary text-white" : "text-dark hover:bg-surface-strong"
                }`}
              >
                <List size={16} />
                List
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                  viewMode === "calendar" ? "bg-primary text-white" : "text-dark hover:bg-surface-strong"
                }`}
              >
                <CalendarDays size={16} />
                Calendar
              </button>
            </div>

            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl bg-surface py-3 pl-12 pr-4 text-sm outline-none"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as BookingStatus | "All")}
              className="rounded-xl bg-surface px-4 py-3 text-sm font-bold outline-none"
            >
              <option value="All">All statuses</option>
              {bookingStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button
              onClick={() => void fetchBookings()}
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-strong text-dark transition hover:bg-primary hover:text-white"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {error ? <p className="mb-5 text-sm font-medium text-red-500">{error}</p> : null}

        {/* List View */}
        {viewMode === "list" && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-bold uppercase tracking-widest text-muted">
                  <th className="pb-6">Booking</th>
                  <th className="pb-6">Customer</th>
                  <th className="pb-6">Event</th>
                  <th className="pb-6">Guests</th>
                  <th className="pb-6">Schedule</th>
                  <th className="pb-6">Status</th>
                  <th className="pb-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="group hover:bg-surface transition-colors">
                    <td className="py-6">
                      <button onClick={() => setSelectedBooking(booking)} className="text-left">
                        <span className="block font-bold text-dark">{booking.id}</span>
                        <span className="text-xs text-muted">{booking.source}</span>
                      </button>
                    </td>
                    <td className="py-6">
                      <div className="space-y-1">
                        <p className="font-bold text-dark">{booking.customerName}</p>
                        <p className="text-xs text-muted">{booking.customerEmail}</p>
                        <p className="text-xs text-muted">{booking.customerPhone}</p>
                      </div>
                    </td>
                    <td className="py-6">
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-dark">{getEventTypeLabel(booking.eventType)}</p>
                        <p className="text-muted">{getZoneLabel(booking.zone)}</p>
                      </div>
                    </td>
                    <td className="py-6 font-bold text-dark">{booking.guests}</td>
                    <td className="py-6">
                      <div className="space-y-1 text-sm">
                        <p className="font-bold text-dark">{booking.date}</p>
                        <p className="text-muted">{formatBookingTime(booking.time)}</p>
                      </div>
                    </td>
                    <td className="py-6">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${bookingStatusStyles[booking.status]}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-6">
                      <div className="flex flex-wrap gap-2">
                        {bookingStatuses.map((status) => (
                          <button
                            key={`${booking.id}-${status}`}
                            onClick={() => updateStatus(booking, status)}
                            className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                              booking.status === status
                                ? "bg-dark text-white"
                                : "bg-surface text-dark hover:bg-primary hover:text-white"
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!loading && filteredBookings.length === 0 ? (
              <div className="p-10 text-center text-muted">No bookings found.</div>
            ) : null}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <BookingCalendar 
            bookings={filteredBookings} 
            onBookingClick={setSelectedBooking}
          />
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
