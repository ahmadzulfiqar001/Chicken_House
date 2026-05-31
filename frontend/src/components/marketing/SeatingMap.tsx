import { useState } from "react";
import { motion } from "motion/react";
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react";

const tables = [
  { id: 1, zone: "Indoor", capacity: 4, status: "available", x: 20, y: 20 },
  { id: 2, zone: "Indoor", capacity: 4, status: "occupied", x: 40, y: 20 },
  { id: 3, zone: "Indoor", capacity: 6, status: "available", x: 60, y: 20 },
  { id: 4, zone: "Indoor", capacity: 2, status: "reserved", x: 80, y: 20 },
  { id: 5, zone: "Outdoor", capacity: 4, status: "available", x: 20, y: 60 },
  { id: 6, zone: "Outdoor", capacity: 8, status: "available", x: 45, y: 60 },
  { id: 7, zone: "Outdoor", capacity: 4, status: "occupied", x: 70, y: 60 },
];

const SeatingMap = () => {
  const [selectedTable, setSelectedTable] = useState<any>(null);

  return (
    <div className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-dark/5 border border-gray-50 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h2 className="text-3xl font-bold text-dark mb-2">Live Seating Map</h2>
          <p className="text-muted">Real-time availability of tables in Renala Khurd branch.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold uppercase tracking-widest">
            <CheckCircle2 size={14} />
            Available
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold uppercase tracking-widest">
            <XCircle size={14} />
            Occupied
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase tracking-widest">
            <Clock size={14} />
            Reserved
          </div>
        </div>
      </div>

      <div className="relative aspect-[4/5] sm:aspect-[16/9] min-h-[420px] sm:min-h-0 bg-surface rounded-[2rem] border-4 border-surface-strong p-4 sm:p-8 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        {/* Tables */}
        {tables.map((table) => (
          <motion.button
            key={table.id}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedTable(table)}
            style={{ left: `${table.x}%`, top: `${table.y}%` }}
            className={`absolute w-16 h-16 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-xl transition-colors ${
              table.status === "available" ? "bg-white text-green-500 border-2 border-green-500/20" :
              table.status === "occupied" ? "bg-red-500 text-white" :
              "bg-yellow-500 text-white"
            } ${selectedTable?.id === table.id ? "ring-4 ring-primary ring-offset-4" : ""}`}
          >
            <span className="text-xs font-bold uppercase tracking-tighter opacity-60">T-{table.id}</span>
            <Users size={20} />
            <span className="text-xs font-bold">{table.capacity}</span>
          </motion.button>
        ))}

        {/* Legend Overlay */}
        <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg hidden md:block">
          <span className="text-xs font-bold text-muted uppercase tracking-widest block mb-2">Selected Table</span>
          {selectedTable ? (
            <div className="space-y-1">
              <p className="text-dark font-bold">Table {selectedTable.id} ({selectedTable.zone})</p>
              <p className="text-muted text-xs">Capacity: {selectedTable.capacity} Guests</p>
              <p className={`text-xs font-bold uppercase ${selectedTable.status === "available" ? "text-green-500" : "text-red-500"}`}>
                Status: {selectedTable.status}
              </p>
            </div>
          ) : (
            <p className="text-muted text-xs italic">Select a table to see details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeatingMap;
