import React from 'react';
import { Trip, Indent, Driver, Vehicle, Invoice } from '../types/logistics';
import { Truck, CheckCircle, IndianRupee, Package } from 'lucide-react';

interface DashboardProps {
  trips: Trip[];
  indents: Indent[];
  drivers: Driver[];
  vehicles: Vehicle[];
  invoices: Invoice[];
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  trips,
  indents,
  drivers,
  vehicles,
  invoices,
  setActiveTab,
}) => {
  // Statistics computation
  const activeTripsCount = trips.filter(t => t.status === 'In Transit' || t.status === 'Dispatched').length;
  const completedTripsCount = trips.filter(t => t.status === 'Completed').length;
  const pendingIndentsCount = indents.filter(i => i.status === 'Open' || i.status === 'Bidding Active').length;
  const availableFleetCount = vehicles.filter(v => v.status === 'Idle' || v.status === 'Active').length;

  const mtdRevenue = trips.reduce((sum, trip) => sum + trip.revenue, 0);
  const pendingPayments = invoices
    .filter(i => i.status === 'Pending' || i.status === 'Partially Paid')
    .reduce((sum, inv) => sum + inv.balanceAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Arsh Logistics Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">High speed middle-mile and cargo logistics network platform</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
          <span className="flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <span className="text-xs font-semibold text-blue-800">Operational Real-Time Mode Enabled</span>
        </div>
      </div>

      {/* Primary KPI Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:border-blue-300 transition-all">
          <div>
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Active Trips</span>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{activeTripsCount}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1 hover:underline cursor-pointer" onClick={() => setActiveTab('trips')}>
              Manage all trips &rarr;
            </p>
          </div>
          <div className="bg-blue-50 p-3.5 rounded-xl text-blue-600">
            <Truck size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:border-emerald-300 transition-all">
          <div>
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Completed Trips</span>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{completedTripsCount}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">Available Fleet: {availableFleetCount}</p>
          </div>
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600">
            <CheckCircle size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:border-amber-300 transition-all">
          <div>
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Open Indents</span>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{pendingIndentsCount}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1 hover:underline cursor-pointer" onClick={() => setActiveTab('indents')}>
              Active Drivers: {drivers.length} &rarr;
            </p>
          </div>
          <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600">
            <Package size={28} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-all">
          <div>
            <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">MTD Revenue</span>
            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">₹{mtdRevenue.toLocaleString()}</h3>
            <p className="text-xs text-indigo-600 font-medium mt-1 hover:underline cursor-pointer" onClick={() => setActiveTab('accounts')}>
              Pending Payments: ₹{pendingPayments.toLocaleString()} &rarr;
            </p>
          </div>
          <div className="bg-indigo-50 p-3.5 rounded-xl text-indigo-600">
            <IndianRupee size={28} />
          </div>
        </div>
      </div>
    </div>
  );
};
