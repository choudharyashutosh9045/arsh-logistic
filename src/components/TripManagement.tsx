import React, { useState } from 'react';
import { Trip, Driver, Vehicle } from '../types/logistics';
import { Plus, Search, Trash2, Edit2, Package, X } from 'lucide-react';

interface TripManagementProps {
  trips: Trip[];
  drivers: Driver[];
  vehicles: Vehicle[];
  onAddTrip: (trip: Trip) => void;
  onUpdateTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
}

export const TripManagement: React.FC<TripManagementProps> = ({
  trips,
  drivers,
  vehicles,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
}) => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Trip Form State - SHIPMENT DETAILS (matching invoice format, NO freight fields)
  const [newTripId, setNewTripId] = useState(`TRP-${Math.floor(10000 + Math.random() * 90000)}`);
  const [newCustomer, setNewCustomer] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newVehicle, setNewVehicle] = useState('');
  const [newDriver, setNewDriver] = useState('');
  const [newCargoType, setNewCargoType] = useState('');

  // Invoice-style shipment fields
  const [shipmentDate, setShipmentDate] = useState('');
  const [lrNo, setLrNo] = useState('');
  const [cnNumber, setCnNumber] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [pkgs, setPkgs] = useState<number>(0);
  const [weightKgs, setWeightKgs] = useState<number>(0);
  const [dateOfArrival, setDateOfArrival] = useState('');
  const [dateOfDelivery, setDateOfDelivery] = useState('');
  const [truckType, setTruckType] = useState('');

  // Edit modal state
  const [selectedTripToEdit, setSelectedTripToEdit] = useState<Trip | null>(null);
  const [fuelExpense, setFuelExpense] = useState<number>(0);
  const [tollExpense, setTollExpense] = useState<number>(0);
  const [miscExpense, setMiscExpense] = useState<number>(0);
  const [driverAdvance, setDriverAdvance] = useState<number>(0);
  const [currLoc, setCurrLoc] = useState('');
  const [currStatus, setCurrStatus] = useState<'In Transit' | 'Completed' | 'Delayed' | 'Dispatched'>('In Transit');

  const availableDrivers = drivers.filter(d => d.status === 'Available' || d.status === 'On Trip');
  const availableVehicles = vehicles.filter(v => v.status === 'Active' || v.status === 'Idle');

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
      t.customer.toLowerCase().includes(search.toLowerCase()) ||
      (t.lrNo || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.cnNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setNewTripId(`TRP-${Math.floor(10000 + Math.random() * 90000)}`);
    setNewCustomer('');
    setNewOrigin('');
    setNewDestination('');
    setNewVehicle('');
    setNewDriver('');
    setNewCargoType('');
    setShipmentDate('');
    setLrNo('');
    setCnNumber('');
    setInvoiceNo('');
    setPkgs(0);
    setWeightKgs(0);
    setDateOfArrival('');
    setDateOfDelivery('');
    setTruckType('');
  };

  const handleCreateTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle || !newDriver || !newOrigin || !newDestination) return;

    const cargoTons = weightKgs ? weightKgs / 1000 : 0;

    const trip: Trip = {
      id: newTripId,
      vehicleNo: newVehicle,
      driverName: newDriver,
      origin: newOrigin,
      destination: newDestination,
      status: 'Dispatched',
      startDate: shipmentDate || new Date().toISOString().split('T')[0],
      expectedDelivery: dateOfDelivery || dateOfArrival || '',
      cargoType: newCargoType,
      cargoWeight: cargoTons,
      customer: newCustomer,
      expenses: { fuel: 0, toll: 0, misc: 0, driverAdvance: 0 },
      revenue: 0,
      currentLocation: newOrigin,
      milestones: [
        { time: new Date().toLocaleTimeString(), location: newOrigin, status: 'Trip Started & Dispatched', completed: true },
        { time: 'TBD', location: newDestination, status: 'Expected Arrival & Destination Delivery', completed: false }
      ],
      // Invoice-style shipment fields
      shipmentDate,
      lrNo,
      cnNumber,
      invoiceNo,
      pkgs,
      weightKgs,
      dateOfArrival,
      dateOfDelivery,
      truckType,
    };

    onAddTrip(trip);
    setIsAddOpen(false);
    resetForm();
  };

  const handleOpenEdit = (trip: Trip) => {
    setSelectedTripToEdit(trip);
    setFuelExpense(trip.expenses.fuel);
    setTollExpense(trip.expenses.toll);
    setMiscExpense(trip.expenses.misc);
    setDriverAdvance(trip.expenses.driverAdvance || 0);
    setCurrLoc(trip.currentLocation);
    setCurrStatus(trip.status);
  };

  const handleUpdateExpensesAndStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripToEdit) return;

    const updated: Trip = {
      ...selectedTripToEdit,
      status: currStatus,
      currentLocation: currLoc,
      expenses: {
        fuel: fuelExpense,
        toll: tollExpense,
        misc: miscExpense,
        driverAdvance: driverAdvance,
      },
    };

    if (currStatus === 'Completed') {
      updated.milestones = updated.milestones.map(m => ({ ...m, completed: true }));
    }

    onUpdateTrip(updated);
    setSelectedTripToEdit(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trip Operations & Dispatch</h1>
          <p className="text-xs text-gray-500 mt-1">Add shipment consignments matching the invoice PDF format</p>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer"
        >
          <Plus size={18} /> New Trip Consignment
        </button>
      </div>

      {/* NEW TRIP / SHIPMENT FORM (no freight fields) */}
      {isAddOpen && (
        <form onSubmit={handleCreateTrip} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Package size={18} className="text-blue-600" /> Add New Shipment Consignment
              </h3>
              <p className="text-xs text-gray-500">Fill shipment details matching the invoice format. Freight charges are added later in Accounts.</p>
            </div>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* SECTION 1: Customer & Trip basics */}
          <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/30 space-y-3">
            <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase">Trip & Party Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Trip Reference ID</label>
                <input
                  type="text"
                  value={newTripId}
                  readOnly
                  className="mt-1 w-full p-2 bg-gray-50 border border-gray-200 text-xs font-medium rounded-lg text-gray-400 outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Customer / Party Name</label>
                <input
                  type="text"
                  required
                  value={newCustomer}
                  onChange={(e) => setNewCustomer(e.target.value.toUpperCase())}
                  placeholder="e.g. GRIVAA SPRINGS PRIVATE LTD."
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Origin / From</label>
                <input
                  type="text"
                  required
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  placeholder="e.g. Haridwar Hub"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Destination / To</label>
                <input
                  type="text"
                  required
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="e.g. Roorkee"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Cargo Category</label>
                <input
                  type="text"
                  value={newCargoType}
                  onChange={(e) => setNewCargoType(e.target.value)}
                  placeholder="e.g. Springs / Auto Parts"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Assign Vehicle / Truck No.</label>
                <select
                  required
                  value={newVehicle}
                  onChange={(e) => setNewVehicle(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                >
                  <option value="">Choose Vehicle...</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.vehicleNo}>
                      {v.vehicleNo} ({v.type})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Assign Driver</label>
                <select
                  required
                  value={newDriver}
                  onChange={(e) => setNewDriver(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                >
                  <option value="">Choose Driver...</option>
                  {availableDrivers.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} ({d.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Invoice-style Shipment Details */}
          <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/20 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-blue-800 tracking-wider uppercase">Shipment Details (Invoice Format)</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">These fields will appear in the freight bill PDF. No money/charges entered here.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Shipment Date</label>
                <input
                  type="date"
                  required
                  value={shipmentDate}
                  onChange={(e) => setShipmentDate(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">LR No.</label>
                <input
                  type="text"
                  value={lrNo}
                  onChange={(e) => setLrNo(e.target.value.toUpperCase())}
                  placeholder="e.g. LR-3382"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">CN Number</label>
                <input
                  type="text"
                  value={cnNumber}
                  onChange={(e) => setCnNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. CN-9012"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Invoice No (optional)</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value.toUpperCase())}
                  placeholder="e.g. INV-1001"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Pkgs (No. of Packages)</label>
                <input
                  type="number"
                  min={0}
                  value={pkgs || ''}
                  onChange={(e) => setPkgs(Number(e.target.value))}
                  placeholder="e.g. 24"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Weight (Kgs)</label>
                <input
                  type="number"
                  min={0}
                  value={weightKgs || ''}
                  onChange={(e) => setWeightKgs(Number(e.target.value))}
                  placeholder="e.g. 5800"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Date of Arrival</label>
                <input
                  type="date"
                  value={dateOfArrival}
                  onChange={(e) => setDateOfArrival(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Date of Delivery</label>
                <input
                  type="date"
                  value={dateOfDelivery}
                  onChange={(e) => setDateOfDelivery(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                />
              </div>
              <div className="col-span-2 md:col-span-3 lg:col-span-2">
                <label className="text-xs font-bold text-gray-700">Truck Type</label>
                <select
                  value={truckType}
                  onChange={(e) => setTruckType(e.target.value)}
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
                >
                  <option value="">Select truck type...</option>
                  <option value="19FT06 TYRE">19FT 06 TYRE</option>
                  <option value="22FT 10 TYRE">22FT 10 TYRE</option>
                  <option value="32FT MX">32FT MX (Multi-Axle)</option>
                  <option value="32FT SX">32FT SX (Single-Axle)</option>
                  <option value="20FT Container">20FT Container</option>
                  <option value="40FT Container">40FT Container</option>
                  <option value="Open Body">Open Body</option>
                  <option value="Reefer Truck">Reefer (Cool-Chain)</option>
                  <option value="Tata Ace">Tata Ace (Mini Truck)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs hover:bg-gray-50 font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-xl text-xs transition cursor-pointer shadow-sm"
            >
              Save & Dispatch Consignment
            </button>
          </div>
        </form>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Trip ID, Vehicle, LR No, CN No, or Customer..."
            className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg w-full text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 font-bold outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="In Transit">In Transit</option>
            <option value="Completed">Completed</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delayed">Delayed</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                <th className="p-4">Trip / LR Details</th>
                <th className="p-4">Customer & Route</th>
                <th className="p-4">Shipment Info</th>
                <th className="p-4">Truck & Driver</th>
                <th className="p-4">Delivery Progress</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No trips found for the given filter or criteria.
                  </td>
                </tr>
              ) : (
                filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-bold rounded">
                        {trip.id}
                      </span>
                      {trip.lrNo && <p className="text-[11px] font-bold text-gray-700 mt-1">LR: {trip.lrNo}</p>}
                      {trip.cnNumber && <p className="text-[10px] text-gray-500">CN: {trip.cnNumber}</p>}
                      {trip.invoiceNo && <p className="text-[10px] text-indigo-600 font-semibold">Inv: {trip.invoiceNo}</p>}
                    </td>
                    <td className="p-4">
                      <p className="text-[11px] font-bold text-indigo-700">{trip.customer}</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">
                        {trip.origin} &rarr; {trip.destination}
                      </p>
                      {trip.cargoType && <p className="text-[10px] text-gray-500 mt-0.5">Cargo: {trip.cargoType}</p>}
                    </td>
                    <td className="p-4">
                      {trip.pkgs ? <p className="text-[11px] text-gray-700"><strong>{trip.pkgs}</strong> pkgs</p> : null}
                      {trip.weightKgs ? <p className="text-[11px] text-gray-700">{trip.weightKgs.toLocaleString()} Kgs</p> : null}
                      {trip.shipmentDate && <p className="text-[10px] text-gray-500 mt-0.5">Ship: {trip.shipmentDate}</p>}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{trip.vehicleNo}</p>
                      {trip.truckType && <p className="text-[10px] text-blue-600 font-semibold">{trip.truckType}</p>}
                      <p className="text-[11px] text-gray-600 mt-0.5">Driver: {trip.driverName}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs text-blue-600 font-bold">{trip.currentLocation}</p>
                      {trip.dateOfDelivery && <p className="text-[10px] text-gray-500 mt-0.5">Expected: {trip.dateOfDelivery}</p>}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold border text-center inline-block ${
                          trip.status === 'In Transit'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : trip.status === 'Completed'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        {trip.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => handleOpenEdit(trip)}
                          className="p-1.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                          title="Update status & expenses"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => onDeleteTrip(trip.id)}
                          className="p-1.5 bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                          title="Delete trip"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal: Status, location & operational expenses */}
      {selectedTripToEdit && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
          <form onSubmit={handleUpdateExpensesAndStatus} className="bg-white max-w-md w-full p-6 rounded-xl border border-gray-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold text-gray-900">
                Update {selectedTripToEdit.id} Status
              </h3>
              <button type="button" onClick={() => setSelectedTripToEdit(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Logistics Tracking Status</label>
              <select
                value={currStatus}
                onChange={(e) => setCurrStatus(e.target.value as any)}
                className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs w-full font-bold outline-none"
              >
                <option value="In Transit">In Transit</option>
                <option value="Completed">Completed</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Current Geo Location Scan</label>
              <input
                type="text"
                required
                value={currLoc}
                onChange={(e) => setCurrLoc(e.target.value)}
                placeholder="e.g. Jaipur Ring Road"
                className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none"
              />
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-[11px] text-gray-500 mb-2 font-semibold">Operational Expenses (internal records only):</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700">Fuel (₹)</label>
                  <input type="number" value={fuelExpense || ''} onChange={(e) => setFuelExpense(Number(e.target.value))} placeholder="₹" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">Toll/Fastag (₹)</label>
                  <input type="number" value={tollExpense || ''} onChange={(e) => setTollExpense(Number(e.target.value))} placeholder="₹" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">Driver Advance (₹)</label>
                  <input type="number" value={driverAdvance || ''} onChange={(e) => setDriverAdvance(Number(e.target.value))} placeholder="₹" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700">Misc. (₹)</label>
                  <input type="number" value={miscExpense || ''} onChange={(e) => setMiscExpense(Number(e.target.value))} placeholder="₹" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setSelectedTripToEdit(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition cursor-pointer"
              >
                Save Updates
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
