import React, { useState, useMemo } from 'react';
import { Trip } from '../types/logistics';
import { Search, MapPin, CheckCircle, Clock, Truck, ShieldAlert, Award, Edit3, X, Plus, Navigation, Filter } from 'lucide-react';

interface OrderTrackingProps {
  trips: Trip[];
  searchTerm: string;
  onUpdateTrip?: (trip: Trip) => void;
}

export const OrderTracking: React.FC<OrderTrackingProps> = ({ trips, searchTerm: defaultSearchTerm, onUpdateTrip }) => {
  const [search, setSearch] = useState(defaultSearchTerm || '');
  const [statusFilter, setStatusFilter] = useState<string>('Running');

  // Running vehicles = In Transit + Dispatched + Delayed
  const runningTrips = useMemo(
    () =>
      trips.filter(
        t => t.status === 'In Transit' || t.status === 'Dispatched' || t.status === 'Delayed'
      ),
    [trips]
  );

  const visibleTrips = useMemo(() => {
    const base =
      statusFilter === 'All'
        ? trips
        : statusFilter === 'Running'
        ? runningTrips
        : trips.filter(t => t.status === statusFilter);
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(
      t =>
        t.id.toLowerCase().includes(q) ||
        t.vehicleNo.toLowerCase().includes(q) ||
        (t.driverName || '').toLowerCase().includes(q) ||
        (t.customer || '').toLowerCase().includes(q) ||
        (t.lrNo || '').toLowerCase().includes(q) ||
        (t.cnNumber || '').toLowerCase().includes(q)
    );
  }, [trips, runningTrips, statusFilter, search]);

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(
    runningTrips.find(t => t.id === defaultSearchTerm) || runningTrips[0] || trips[0] || null
  );

  // Sync the right-pane selection if the live data changes
  const currentSelected = useMemo(
    () => (selectedTrip ? trips.find(t => t.id === selectedTrip.id) || null : null),
    [trips, selectedTrip]
  );

  // Manual location update modal
  const [updateOpen, setUpdateOpen] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState('Transit checkpoint update');
  const [addAsMilestone, setAddAsMilestone] = useState(true);
  const [updateStatus, setUpdateStatus] = useState<'In Transit' | 'Completed' | 'Delayed' | 'Dispatched'>('In Transit');

  const openUpdateModal = (trip: Trip) => {
    setSelectedTrip(trip);
    setNewLocation('');
    setMilestoneStatus('Transit checkpoint update');
    setAddAsMilestone(true);
    setUpdateStatus(trip.status);
    setUpdateOpen(true);
  };

  const handleLocationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelected || !onUpdateTrip || !newLocation.trim()) return;

    const now = new Date();
    const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const updated: Trip = {
      ...currentSelected,
      currentLocation: newLocation,
      status: updateStatus,
      milestones: addAsMilestone
        ? [
            ...currentSelected.milestones.filter(m => !(m.location === newLocation && !m.completed)),
            {
              time: timeStr,
              location: newLocation,
              status: milestoneStatus || 'Location update',
              completed: true,
            },
          ]
        : currentSelected.milestones,
    };

    if (updateStatus === 'Completed') {
      updated.milestones = updated.milestones.map(m => ({ ...m, completed: true }));
    }

    onUpdateTrip(updated);
    setUpdateOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Live Cargo Tracking</h1>
          <p className="text-xs text-gray-500 mt-1">All running vehicles with real-time status & manual location update.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <span className="flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="text-xs font-bold text-emerald-800">{runningTrips.length} Vehicles Running</span>
        </div>
      </div>

      {/* Search + Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex-1 flex flex-col sm:flex-row items-center gap-3 w-full"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Trip ID, Vehicle No, LR No, CN No, Driver or Customer..."
              className="pl-9 pr-4 py-2.5 border border-gray-200 hover:border-gray-300 focus:border-blue-500 rounded-xl bg-gray-50/50 w-full text-xs placeholder-gray-400 outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 font-bold outline-none cursor-pointer"
            >
              <option value="Running">🟢 All Running ({runningTrips.length})</option>
              <option value="In Transit">In Transit</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delayed">Delayed</option>
              <option value="Completed">Completed</option>
              <option value="All">Show All Trips</option>
            </select>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: List of running vehicles */}
        <div className="xl:col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Truck size={16} className="text-blue-600" /> Running Fleet ({visibleTrips.length})
              </h3>
              <p className="text-[10px] text-gray-500 mt-0.5">Click any vehicle to view & update</p>
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-[640px] overflow-y-auto">
            {visibleTrips.length === 0 ? (
              <div className="p-8 text-center">
                <ShieldAlert className="mx-auto text-amber-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-600">No vehicles match your filter.</p>
              </div>
            ) : (
              visibleTrips.map((trip) => {
                const isActive = currentSelected?.id === trip.id;
                return (
                  <button
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`w-full text-left p-4 transition cursor-pointer ${
                      isActive
                        ? 'bg-blue-50/70 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                        {trip.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          trip.status === 'In Transit'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : trip.status === 'Dispatched'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : trip.status === 'Delayed'
                            ? 'bg-amber-50 border-amber-200 text-amber-700'
                            : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 mt-1.5">{trip.vehicleNo}</p>
                    <p className="text-[11px] text-gray-600 truncate">
                      {trip.origin} → {trip.destination}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-blue-700 font-semibold">
                      <MapPin size={10} /> {trip.currentLocation}
                    </div>
                    {trip.driverName && (
                      <p className="text-[10px] text-gray-500 mt-1">Driver: {trip.driverName}</p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Selected trip details + manual update */}
        <div className="xl:col-span-2 space-y-6">
          {!currentSelected ? (
            <div className="bg-white p-10 rounded-xl border border-gray-200 shadow-sm text-center">
              <ShieldAlert className="mx-auto text-amber-500 mb-2 animate-bounce" size={42} />
              <p className="text-sm font-bold text-gray-700">Select a vehicle from the left panel</p>
              <p className="text-xs text-gray-500 mt-1">Live trace & manual location update will appear here.</p>
            </div>
          ) : (
            <>
              {/* Top action bar */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-gray-900">{currentSelected.id}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                      {currentSelected.vehicleNo}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        currentSelected.status === 'In Transit'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : currentSelected.status === 'Completed'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : currentSelected.status === 'Delayed'
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      }`}
                    >
                      {currentSelected.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">
                    Route: {currentSelected.origin} → {currentSelected.destination}
                  </p>
                  <p className="text-[11px] text-blue-700 font-semibold mt-1 flex items-center gap-1">
                    <MapPin size={11} /> Current: {currentSelected.currentLocation}
                  </p>
                </div>
                <button
                  onClick={() => openUpdateModal(currentSelected)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-sm cursor-pointer"
                >
                  <Edit3 size={14} /> Update Location Manually
                </button>
              </div>

              {/* Timeline + cargo details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Timeline */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Navigation size={16} className="text-blue-600" /> Trip Milestones & Route Progress
                  </h4>

                  <div className="mt-6 relative border-l-2 border-dashed border-blue-200 ml-5 pl-8 space-y-7">
                    {currentSelected.milestones.map((milestone, idx) => {
                      const isCompleted = milestone.completed;
                      return (
                        <div key={idx} className="relative">
                          <div
                            className={`absolute -left-12 top-0 h-9 w-9 rounded-full flex items-center justify-center border-2 bg-white transition ${
                              isCompleted
                                ? 'border-blue-600 bg-blue-50 text-blue-600'
                                : 'border-gray-200 text-gray-400'
                            }`}
                          >
                            {isCompleted ? <CheckCircle size={18} /> : <Clock size={16} />}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h5 className={`text-sm font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                                {milestone.location}
                              </h5>
                              <span className="text-[10px] font-semibold text-gray-400">{milestone.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{milestone.status}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 border-t border-gray-100 pt-4">
                    <div className="h-44 bg-slate-50 border border-gray-200/80 rounded-xl relative overflow-hidden flex flex-col justify-between p-4">
                      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                      <div className="flex justify-between items-start z-10">
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-100 p-2 rounded-lg">
                          <Truck className="text-blue-600" size={16} />
                          <div>
                            <h5 className="text-xs font-bold text-gray-800 leading-none">{currentSelected.vehicleNo}</h5>
                            <p className="text-[10px] text-gray-500 mt-0.5">Last scan: {currentSelected.currentLocation}</p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded z-10">
                          GPS + Manual Sync
                        </span>
                      </div>
                      <div className="z-10 flex flex-wrap justify-between items-center text-xs border-t border-gray-100/60 pt-2 text-gray-700 font-medium bg-white/70 backdrop-blur-sm p-2 rounded-lg">
                        <span>Driver: <strong className="text-blue-700">{currentSelected.driverName || '—'}</strong></span>
                        <span>{currentSelected.milestones.filter(m => m.completed).length}/{currentSelected.milestones.length} checkpoints</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cargo / shipment summary */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">Consignment Details</h4>
                    <div className="mt-4 space-y-2.5 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Customer:</span> <span className="font-bold text-gray-900">{currentSelected.customer || '—'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Cargo:</span> <span className="font-bold text-gray-900">{currentSelected.cargoType || '—'}</span></div>
                      {currentSelected.lrNo && <div className="flex justify-between"><span className="text-gray-500">LR No:</span> <span className="font-bold text-gray-900">{currentSelected.lrNo}</span></div>}
                      {currentSelected.cnNumber && <div className="flex justify-between"><span className="text-gray-500">CN No:</span> <span className="font-bold text-gray-900">{currentSelected.cnNumber}</span></div>}
                      {currentSelected.pkgs ? <div className="flex justify-between"><span className="text-gray-500">Packages:</span> <span className="font-bold text-gray-900">{currentSelected.pkgs}</span></div> : null}
                      {currentSelected.weightKgs ? <div className="flex justify-between"><span className="text-gray-500">Weight:</span> <span className="font-bold text-gray-900">{currentSelected.weightKgs.toLocaleString()} Kgs</span></div> : null}
                      {currentSelected.truckType && <div className="flex justify-between"><span className="text-gray-500">Truck Type:</span> <span className="font-bold text-gray-900">{currentSelected.truckType}</span></div>}
                      <div className="flex justify-between border-t border-gray-50 pt-2.5"><span className="text-gray-500">Expected Delivery:</span> <span className="font-bold text-blue-700">{currentSelected.dateOfDelivery || currentSelected.expectedDelivery || '—'}</span></div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <Award size={15} className="text-blue-600" /> Proof of Delivery
                    </h4>
                    <div className="mt-3">
                      {currentSelected.podUrl ? (
                        <div className="space-y-2">
                          <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded font-bold">
                            POD Verified
                          </span>
                          <img
                            src={currentSelected.podUrl}
                            alt="POD"
                            className="w-full h-28 object-cover border border-gray-200 rounded-lg"
                          />
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-200/80 p-4 rounded-lg text-center bg-gray-50/50">
                          <p className="text-[11px] text-gray-600 font-medium">No POD uploaded yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* MANUAL LOCATION UPDATE MODAL */}
      {updateOpen && currentSelected && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <form onSubmit={handleLocationUpdate} className="bg-white max-w-md w-full p-6 rounded-xl border border-gray-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600" /> Update Location Manually
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">{currentSelected.id} — {currentSelected.vehicleNo}</p>
              </div>
              <button type="button" onClick={() => setUpdateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="bg-blue-50/40 border border-blue-100 rounded-lg p-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Current Last-Known Location</p>
              <p className="text-sm font-bold text-blue-700 mt-0.5 flex items-center gap-1.5">
                <MapPin size={12} /> {currentSelected.currentLocation}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">New Current Location *</label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Jaipur Bypass, NH-48 KM 245"
                className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 hover:border-gray-300 transition"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700">Update Trip Status</label>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value as any)}
                className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 transition cursor-pointer"
              >
                <option value="In Transit">In Transit</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed (Delivered)</option>
              </select>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addAsMilestone}
                  onChange={(e) => setAddAsMilestone(e.target.checked)}
                  className="h-4 w-4 accent-blue-600"
                />
                <span className="text-xs font-bold text-gray-700">Save as a checkpoint milestone</span>
              </label>
              {addAsMilestone && (
                <div className="mt-2">
                  <label className="text-xs font-bold text-gray-700">Milestone Note</label>
                  <input
                    type="text"
                    value={milestoneStatus}
                    onChange={(e) => setMilestoneStatus(e.target.value)}
                    placeholder="e.g. Crossed toll plaza, fueling stop"
                    className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setUpdateOpen(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition shadow-sm cursor-pointer"
              >
                <Plus size={12} /> Save Location Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
