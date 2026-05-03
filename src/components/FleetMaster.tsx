import React, { useState } from 'react';
import { Driver, Vehicle } from '../types/logistics';
import { Plus, Search, Truck, UserCheck, Shield, Trash2 } from 'lucide-react';

interface FleetMasterProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  onAddDriver: (driver: Driver) => void;
  onAddVehicle: (vehicle: Vehicle) => void;
  onDeleteDriver: (id: string) => void;
  onDeleteVehicle: (id: string) => void;
}

export const FleetMaster: React.FC<FleetMasterProps> = ({
  drivers,
  vehicles,
  onAddDriver,
  onAddVehicle,
  onDeleteDriver,
  onDeleteVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'drivers'>('vehicles');
  const [search, setSearch] = useState('');
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  // Vehicle Form state
  const [vehicleNo, setVehicleNo] = useState('');
  const [model, setModel] = useState('');
  const [capacity, setCapacity] = useState<number>(0);
  const [type, setType] = useState('');
  const [branch, setBranch] = useState('');

  // Driver Form state
  const [driverName, setDriverName] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [phone, setPhone] = useState('');
  const [pan, setPan] = useState('');

  const filteredVehicles = vehicles.filter(v =>
    v.vehicleNo.toLowerCase().includes(search.toLowerCase()) ||
    v.branch.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.phone.includes(search)
  );

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNo || !model) return;

    const newVehicle: Vehicle = {
      id: `VEH-${Math.floor(100 + Math.random() * 900)}`,
      vehicleNo,
      model,
      capacity,
      type,
      status: 'Idle',
      branch,
    };

    onAddVehicle(newVehicle);
    setIsAddVehicleOpen(false);
    // Reset inputs
    setVehicleNo('');
    setModel('');
    setCapacity(0);
    setType('');
    setBranch('');
  };

  const handleAddDriver = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverName || !licenseNo) return;

    const newDriver: Driver = {
      id: `DRV-${Math.floor(100 + Math.random() * 900)}`,
      name: driverName,
      licenseNo,
      phone,
      pan,
      status: 'Available',
    };

    onAddDriver(newDriver);
    setIsAddDriverOpen(false);
    // Reset inputs
    setDriverName('');
    setLicenseNo('');
    setPhone('');
    setPan('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Fleet & Asset Master</h1>
          <p className="text-xs text-gray-500 mt-1">Manage vehicles, verify operators/drivers, and assign hub branches</p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'vehicles' ? (
            <button
              onClick={() => setIsAddVehicleOpen(!isAddVehicleOpen)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              <Plus size={16} /> New Fleet Asset
            </button>
          ) : (
            <button
              onClick={() => setIsAddDriverOpen(!isAddDriverOpen)}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
            >
              <Plus size={16} /> New Fleet Operator
            </button>
          )}
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex bg-white p-1 rounded-xl border border-gray-200/80 shadow-sm max-w-xs">
        <button
          onClick={() => {
            setActiveTab('vehicles');
            setSearch('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'vehicles'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Truck size={14} /> Fleet Trucks
        </button>
        <button
          onClick={() => {
            setActiveTab('drivers');
            setSearch('');
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeTab === 'drivers'
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <UserCheck size={14} /> Certified Drivers
        </button>
      </div>

      {/* Add New Vehicle Form Modal Overlay */}
      {isAddVehicleOpen && (
        <form onSubmit={handleAddVehicle} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 border-b border-gray-100 pb-2 mb-1">
            <h3 className="text-sm font-bold text-gray-800">Enroll New Logistics Vehicle Asset</h3>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Vehicle Plate / Registration Number</label>
            <input
              type="text"
              required
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              placeholder="e.g. MH 12 GH 9922"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Vehicle Model / Manufacturer</label>
            <input
              type="text"
              required
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. TATA LPT 1918"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Total Capacity (MT)</label>
            <input
              type="number"
              required
              value={capacity || ''}
              onChange={(e) => setCapacity(Number(e.target.value))}
              placeholder="e.g. 14"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Category Type</label>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            >
              <option value="">Choose Truck Body Category...</option>
              <option value="Open Body">Open Body</option>
              <option value="Container 32FT MX">Container 32FT MX</option>
              <option value="TATA Ultra 22FT">TATA Ultra 22FT</option>
              <option value="Reefer (Cool-Chain)">Reefer (Cool-Chain)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-bold text-gray-700">Assigned Branch / Base Location Hub</label>
            <input
              type="text"
              required
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Delhi Head Office"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-1.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition cursor-pointer shadow-sm"
            >
              Save New Truck
            </button>
          </div>
        </form>
      )}

      {/* Add New Driver Form Modal Overlay */}
      {isAddDriverOpen && (
        <form onSubmit={handleAddDriver} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 border-b border-gray-100 pb-2 mb-1">
            <h3 className="text-sm font-bold text-gray-800">Enroll New Driver Operator</h3>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Driver Legal Name</label>
            <input
              type="text"
              required
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">License Number</label>
            <input
              type="text"
              required
              value={licenseNo}
              onChange={(e) => setLicenseNo(e.target.value)}
              placeholder="e.g. DL14 20120191122"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Primary Contact Phone</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +91 98765 12345"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Tax Identification ID (PAN / SSN)</label>
            <input
              type="text"
              required
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              placeholder="e.g. ABCDE1234F"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 mt-1.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddDriverOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition cursor-pointer shadow-sm"
            >
              Enroll Driver Operator
            </button>
          </div>
        </form>
      )}

      {/* Grid List View Display & Filter Action */}
      <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === 'vehicles' ? 'vehicles, branches, or IDs' : 'driver names, phone, or license'}...`}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-full text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
          />
        </div>
      </div>

      {activeTab === 'vehicles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVehicles.length === 0 ? (
            <div className="md:col-span-3 text-center py-10 text-gray-500 font-medium">No logistics vehicles found.</div>
          ) : (
            filteredVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-100 hover:shadow-md transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-800 text-xs font-bold rounded">
                      {vehicle.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 border text-xs font-bold rounded-full ${
                        vehicle.status === 'Active'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          : vehicle.status === 'Idle'
                          ? 'bg-gray-50 border-gray-200 text-gray-600'
                          : 'bg-red-50 border-red-100 text-red-600'
                      }`}
                    >
                      {vehicle.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mt-1">{vehicle.vehicleNo}</h3>
                    <p className="text-xs font-semibold text-gray-600">{vehicle.model}</p>
                    <p className="text-[11px] text-gray-500">Branch Base: {vehicle.branch}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs text-gray-600 font-medium">
                    <span>Type: <strong>{vehicle.type}</strong></span>
                    <span>Load cap: <strong>{vehicle.capacity} MT</strong></span>
                  </div>
                </div>
                <div className="flex justify-end pt-3 mt-3 border-t border-gray-50">
                  <button
                    onClick={() => onDeleteVehicle(vehicle.id)}
                    className="p-1.5 bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                    title="Delete this truck from system"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrivers.length === 0 ? (
            <div className="md:col-span-3 text-center py-10 text-gray-500 font-medium">No registered drivers found.</div>
          ) : (
            filteredDrivers.map((driver) => (
              <div key={driver.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-blue-100 hover:shadow-md transition flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs font-bold rounded">
                      {driver.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 border text-xs font-bold rounded-full ${
                        driver.status === 'Available'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          : 'bg-amber-50 border-amber-100 text-amber-700'
                      }`}
                    >
                      {driver.status}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mt-1">{driver.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Shield size={12} /> DL: {driver.licenseNo}
                    </p>
                    <p className="text-xs text-gray-600 font-semibold mt-1">Phone: {driver.phone}</p>
                    <p className="text-[11px] text-gray-500">PAN Card: {driver.pan}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-3 mt-3 border-t border-gray-50">
                  <button
                    onClick={() => onDeleteDriver(driver.id)}
                    className="p-1.5 bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                    title="Remove this operator"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
