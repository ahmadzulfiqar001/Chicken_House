import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock, RefreshCw, Users } from "lucide-react";
import { formatBookingTime, getZoneLabel } from "../../lib/booking";
import { useRealtime } from "../../lib/realtime";

type TableStatus = "available" | "reserved";

type TableInfo = {
  id: number;
  zoneId: string;
  label: string;
  capacity: number;
  section: string;
};

type SeatingMapProps = {
  selectedTableId?: number;
  date?: string;
  time?: string;
  onSelectTable?: (table: Pick<TableInfo, "id" | "zoneId" | "capacity">) => void;
};

type AvailabilityResponse = {
  reservedZones?: string[];
  reservations?: Array<{
    id: string;
    zone: string;
    tableId?: number;
    date: string;
    time: string;
    guests: number;
  }>;
};

const tables: TableInfo[] = [
  { id: 1, zoneId: "outdoor", label: "Garden A", capacity: 4, section: "Outdoor" },
  { id: 2, zoneId: "outdoor", label: "Garden B", capacity: 4, section: "Outdoor" },
  { id: 3, zoneId: "indoor", label: "Hall A", capacity: 6, section: "Indoor" },
  { id: 4, zoneId: "indoor", label: "Hall B", capacity: 8, section: "Indoor" },
  { id: 5, zoneId: "rooftop", label: "Family A", capacity: 4, section: "Family" },
  { id: 6, zoneId: "rooftop", label: "Family B", capacity: 6, section: "Family" },
  { id: 7, zoneId: "outdoor", label: "Garden C", capacity: 10, section: "Outdoor" },
  { id: 8, zoneId: "indoor", label: "Hall Family", capacity: 14, section: "Indoor" },
  { id: 9, zoneId: "rooftop", label: "Family Lounge", capacity: 12, section: "Family" },
];

const emptyAvailability: AvailabilityResponse = {
  reservedZones: [],
  reservations: [],
};

const SeatingMap = ({ selectedTableId = 0, date = "", time = "", onSelectTable }: SeatingMapProps) => {
  const [localSelectedTableId, setLocalSelectedTableId] = useState<number | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResponse>(emptyAvailability);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const hasSchedule = Boolean(date && time);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (hasSchedule) {
        params.set("date", date);
        params.set("time", time);
      }

      const query = params.toString();
      const response = await fetch(`/api/bookings/availability${query ? `?${query}` : ""}`);
      const data = (await response.json()) as AvailabilityResponse & { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Availability could not be loaded.");
      }

      setAvailability(data);
    } catch (availabilityError) {
      console.error(availabilityError);
      setError("Availability could not be loaded.");
      setAvailability(emptyAvailability);
    } finally {
      setLoading(false);
    }
  }, [date, hasSchedule, time]);

  useEffect(() => {
    void fetchAvailability();
  }, [fetchAvailability]);

  useRealtime("bookings", () => {
    void fetchAvailability();
  });

  useEffect(() => {
    setLocalSelectedTableId(selectedTableId > 0 ? selectedTableId : null);
  }, [selectedTableId]);

  const reservedTableIds = useMemo(
    () => new Set((availability.reservations ?? []).map((reservation) => Number(reservation.tableId ?? 0)).filter(Boolean)),
    [availability.reservations],
  );

  const legacyReservedZones = useMemo(
    () =>
      new Set(
        (availability.reservations ?? [])
          .filter((reservation) => !Number(reservation.tableId ?? 0))
          .map((reservation) => reservation.zone),
      ),
    [availability.reservations],
  );

  const displayTables = useMemo(
    () =>
      tables.map((table) => ({
        ...table,
        status: (reservedTableIds.has(table.id) || legacyReservedZones.has(table.zoneId) ? "reserved" : "available") as TableStatus,
      })),
    [legacyReservedZones, reservedTableIds],
  );

  const activeSelectedTableId = selectedTableId || localSelectedTableId || 0;
  const reservedCount = displayTables.filter((table) => table.status === "reserved").length;

  const handleSelectTable = (table: (typeof displayTables)[number]) => {
    if (table.status === "reserved") {
      return;
    }

    setLocalSelectedTableId(table.id);
    onSelectTable?.({ id: table.id, zoneId: table.zoneId, capacity: table.capacity });
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-4 shadow-xl shadow-dark/5 sm:p-6">
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-dark">Table Availability</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {hasSchedule ? `${date} at ${formatBookingTime(time)}` : "Confirmed reservation status"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-600">
            <CheckCircle2 size={14} />
            Free {displayTables.length - reservedCount}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-700">
            <Clock size={14} />
            Reserved {reservedCount}
          </div>
          <button
            type="button"
            onClick={() => void fetchAvailability()}
            className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-bold text-dark transition hover:bg-surface-strong"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error ? <p className="mb-5 text-sm font-medium text-red-500">{error}</p> : null}

      <div className="rounded-[1.75rem] border border-surface-strong bg-[#fff8eb] p-3 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {displayTables.map((table) => {
            const isSelected = activeSelectedTableId === table.id;
            const isReserved = table.status === "reserved";

            return (
              <motion.div
                key={table.id}
                whileHover={{ y: isReserved ? 0 : -3 }}
                className={`flex min-h-[156px] flex-col rounded-2xl border p-4 shadow-sm transition ${
                  isReserved
                    ? "border-yellow-500/35 bg-yellow-50 text-yellow-900"
                    : isSelected
                      ? "border-primary bg-white text-primary shadow-primary/10"
                      : "border-green-500/25 bg-white text-green-700 hover:border-primary/50"
                } ${isSelected ? "ring-4 ring-primary/20 ring-offset-2" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectTable(table)}
                  className="flex flex-1 flex-col text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-muted">T-{table.id}</span>
                      <p className="mt-2 truncate text-lg font-bold text-dark">{table.label}</p>
                      <p className="mt-1 text-sm leading-5 text-muted">{getZoneLabel(table.zoneId)}</p>
                    </div>
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        isReserved ? "bg-yellow-500/15 text-yellow-700" : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      <Users size={18} />
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-dark">
                      {table.capacity} seats
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        isReserved ? "bg-yellow-500/15 text-yellow-700" : "bg-green-500/10 text-green-600"
                      }`}
                    >
                      {isReserved ? "Reserved" : "Free"}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={isReserved}
                  onClick={() => handleSelectTable(table)}
                  className={`mt-4 h-10 rounded-xl text-sm font-bold transition ${
                    isReserved
                      ? "cursor-not-allowed bg-yellow-500/15 text-yellow-700"
                      : "bg-primary text-white shadow-lg shadow-primary/15 hover:bg-primary-strong"
                  }`}
                >
                  {isReserved ? "Reserved" : isSelected ? "Selected" : "Reserve"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SeatingMap;
