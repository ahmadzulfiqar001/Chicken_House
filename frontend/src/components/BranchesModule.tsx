import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Users, Phone, Star, Plus, Search, Filter, Download, ExternalLink } from "lucide-react";

const BranchesModule = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const branches = [
    { id: "BR-001", name: "Renala Khurd (Main)", address: "Near Mitchell's Fair Price Shop, GT Road", manager: "Ahmed Raza", staff: 24, status: "Active", rating: 4.9 },
    { id: "BR-002", name: "Okara City", address: "Benazir Road, Okara", manager: "Sana Malik", staff: 18, status: "Active", rating: 4.7 },
    { id: "BR-003", name: "Sahiwal Bypass", address: "GT Road, Sahiwal", manager: "Zubair Khan", staff: 15, status: "Active", rating: 4.8 },
    { id: "BR-004", name: "Pattoki", address: "Main Bazaar, Pattoki", manager: "Farhan Ali", staff: 12, status: "Under Construction", rating: 0 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-dark">Branches Management</h2>
          <p className="text-muted">Manage restaurant locations and performance.</p>
        </div>
        <button className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus size={20} />
          Add New Branch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Total Branches</p>
              <h3 className="text-2xl font-bold text-dark">4</h3>
            </div>
          </div>
          <p className="text-muted text-xs">3 Active, 1 Upcoming</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Total Staff</p>
              <h3 className="text-2xl font-bold text-dark">69</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Across all locations</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
              <Star size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Avg. Rating</p>
              <h3 className="text-2xl font-bold text-dark">4.8</h3>
            </div>
          </div>
          <p className="text-muted text-xs">Based on 5.2k reviews</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search branches..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border-none focus:ring-2 focus:ring-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-3 rounded-xl bg-surface text-dark font-bold flex items-center gap-2 hover:bg-surface-strong transition-all">
              <Filter size={18} />
              Filter
            </button>
            <button className="px-4 py-3 rounded-xl bg-surface text-dark font-bold flex items-center gap-2 hover:bg-surface-strong transition-all">
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface text-muted text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-4">Branch ID</th>
                <th className="px-8 py-4">Name</th>
                <th className="px-8 py-4">Address</th>
                <th className="px-8 py-4">Manager</th>
                <th className="px-8 py-4">Staff</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Rating</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-8 py-6 font-mono text-sm">{branch.id}</td>
                  <td className="px-8 py-6 font-bold text-dark">{branch.name}</td>
                  <td className="px-8 py-6 text-sm text-muted">{branch.address}</td>
                  <td className="px-8 py-6 font-bold text-dark">{branch.manager}</td>
                  <td className="px-8 py-6 text-sm text-muted">{branch.staff}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      branch.status === 'Active' ? 'bg-green-50 text-green-500' : 
                      branch.status === 'Under Construction' ? 'bg-yellow-50 text-yellow-500' : 'bg-red-50 text-red-500'
                    }`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <Star size={14} fill="currentColor" />
                      {branch.rating > 0 ? branch.rating : "N/A"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className="text-primary font-bold hover:underline flex items-center gap-1">
                      View Details
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BranchesModule;
