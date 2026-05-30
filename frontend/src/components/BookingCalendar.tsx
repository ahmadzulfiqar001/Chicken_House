import { useState, useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { bookingStatusStyles, type BookingStatus } from "../lib/booking";

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

type BookingCalendarProps = {
  bookings: BookingRecord[];
  onBookingClick: (booking: BookingRecord) => void;
};

const BookingCalendar = ({ bookings, onBookingClick }: BookingCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, BookingRecord[]> = {};
    bookings.forEach(booking => {
      if (!grouped[booking.date]) {
        grouped[booking.date] = [];
      }
      grouped[booking.date].push(booking);
    });
    return grouped;
  }, [bookings]);

  // Generate calendar days
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i),
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      date: new Date(year, month, day),
    });
  }

  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      date: new Date(year, month + 1, day),
    });
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().slice(0, 10);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-dark">
          {monthNames[month]} {year}
        </h3>
        <div className="flex items-center gap-3">
          <button onClick={goToToday} className="rounded-xl bg-surface px-4 py-2 text-sm font-bold text-dark hover:bg-surface-strong transition">
            Today
          </button>
          <button onClick={previousMonth} className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextMonth} className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-dark hover:bg-primary hover:text-white transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-lg">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-bold uppercase tracking-widest text-muted py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayInfo, index) => {
            const dateKey = formatDateKey(dayInfo.date);
            const dayBookings = bookingsByDate[dateKey] || [];
            const isCurrentDay = isToday(dayInfo.date);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.005 }}
                className={`min-h-[120px] rounded-2xl border-2 p-3 transition-all ${
                  dayInfo.isCurrentMonth
                    ? isCurrentDay
                      ? "border-primary bg-primary/5"
                      : "border-gray-100 bg-white hover:border-primary/30 hover:shadow-md"
                    : "border-transparent bg-surface/50"
                }`}
              >
                <div className={`text-sm font-bold mb-2 ${
                  dayInfo.isCurrentMonth
                    ? isCurrentDay
                      ? "text-primary"
                      : "text-dark"
                    : "text-muted"
                }`}>
                  {dayInfo.day}
                </div>

                {/* Bookings for this day */}
                <div className="space-y-1">
                  {dayBookings.slice(0, 3).map(booking => (
                    <button
                      key={booking.id}
                      onClick={() => onBookingClick(booking)}
                      className={`w-full rounded-lg px-2 py-1 text-left text-xs font-bold transition-all hover:scale-105 ${bookingStatusStyles[booking.status]}`}
                    >
                      <div className="truncate">{booking.customerName}</div>
                      <div className="truncate text-[10px] opacity-75">{booking.time} • {booking.guests}p</div>
                    </button>
                  ))}
                  {dayBookings.length > 3 && (
                    <div className="text-center text-[10px] font-bold text-muted">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-4">
        <span className="text-sm font-bold text-muted">Status:</span>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <span className="text-xs font-bold text-dark">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
          <span className="text-xs font-bold text-dark">Confirmed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="text-xs font-bold text-dark">Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <span className="text-xs font-bold text-dark">Cancelled</span>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
