import React, { useState } from 'react';
import { Indent, Trip } from '../types/logistics';
import { Package, Search, PlusCircle, Clock } from 'lucide-react';

interface ClientPortalProps {
  indents: Indent[];
  trips: Trip[];
  onAddIndent: (indent: Indent) => void;
  setActiveTab: (tab: string) => void;
  setSearchTerm: (term: string) => void;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  indents,
  trips,
  onAddIndent,
  setActiveTab,
  setSearchTerm,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'track'>('create');
  const [search, setSearch] = useState('');

  // New indent form state
  const [customer, setCustomer] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [weight, setWeight] = useState<number>(0);
  const [pickupDate, setPickupDate] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const filteredClientIndents = indents.filter(i =>
    i.customer.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toLowerCase().includes(search.toLowerCase())
  );

  const handlePostDemand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !origin || !destination) return;

    const newIndent: Indent = {
      id: `IND-${Math.floor(1000 + Math.random() * 900)}`,
      customer,
      origin,
      destination,
      cargoType,
      weight,
      pickupDate,
      vehicleType,
      status: 'Open',
      bids: [],
    };

    onAddIndent(newIndent);
    setCustomer('');
    setCargoType('');
    setOrigin('');
    setDestination('');
    setWeight(0);
    setPickupDate('');
    setVehicleType('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">External Client & Vendor Desk</h1>
        <p className="text-xs text-gray-500 mt-1">Submit logistics freight requests, monitor deliveries, and accept quotes.</p>
      </div>

      {/* Sub tabs Navigation */}
      <div className="flex bg-white p-1 rounded-xl border border-gray-200/80 shadow-sm max-w-xs">
        <button
          onClick={() => setActiveSubTab('create')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'create'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <PlusCircle size={14} /> Submit Demand
        </button>
        <button
          onClick={() => setActiveSubTab('track')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'track'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock size={14} /> Manage Requests
        </button>
      </div>

      {activeSubTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handlePostDemand} className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
              Book Cargo Truck Transit Demand
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700">Company Name</label>
                <input
                  type="text"
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="e.g. Apollo Tyres"
                  className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Consignment Category</label>
                <input
                  type="text"
                  required
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  placeholder="e.g. Tyres & Spare parts"
                  className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Source Depot City</label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Chennai"
                  className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Destination DC</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Cargo Weight (MT)</label>
                <input
                  type="number"
                  required
                  value={weight || ''}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  placeholder="e.g. 12"
                  className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Pickup Schedule Date</label>
                <input
                  type="date"
                  required
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Desired Truck Model</label>
                <input
                  type="text"
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  placeholder="e.g. Container 32FT / Open Body"
                  className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl text-xs transition shadow-sm cursor-pointer"
              >
                Create Transport Request
              </button>
            </div>
          </form>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Direct Live Shipment Trace</h3>
              <p className="text-xs text-gray-500 mt-1">If your cargo request is dispatched, trace it directly here.</p>

              <div className="mt-4 space-y-4">
                {trips.slice(0, 2).map((trip) => (
                  <div key={trip.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-800">{trip.id}</h4>
                      <p className="text-[10px] font-medium text-gray-500">To: {trip.destination}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSearchTerm(trip.id);
                        setActiveTab('tracking');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-600 hover:border-blue-300 font-bold border border-blue-200 rounded text-[10px] cursor-pointer transition"
                    >
                      Real-time Trace
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <Package size={16} /> Continuous 24/7 client desk available.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800">Historical & Active Requests</h3>
              <p className="text-xs text-gray-500">Check tracking status of previous demand indents.</p>
            </div>
            <div className="relative flex-1 sm:max-w-xs w-full">
              <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests..."
                className="pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs w-full hover:border-gray-300 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden mt-2">
            {filteredClientIndents.length === 0 ? (
              <p className="p-8 text-center text-xs font-medium text-gray-500">No requests match criteria.</p>
            ) : (
              filteredClientIndents.map((indent) => (
                <div key={indent.id} className="p-3.5 flex flex-wrap justify-between items-center gap-3.5 hover:bg-gray-50/50 transition duration-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 font-bold rounded text-xs">
                        {indent.id}
                      </span>
                      <span className="text-sm font-bold text-gray-900">{indent.customer}</span>
                    </div>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                      Route: {indent.origin} &rarr; {indent.destination}
                    </p>
                    <p className="text-[11px] text-gray-400">Cargo: {indent.cargoType} ({indent.weight} MT) • Vehicle type: {indent.vehicleType}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-0.5 border rounded-full text-[11px] font-bold ${
                        indent.status === 'Open'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                          : 'bg-indigo-50 border-indigo-100 text-indigo-800'
                      }`}
                    >
                      {indent.status}
                    </span>
                    <span className="text-[10px] text-gray-400">Submitted: {indent.pickupDate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
