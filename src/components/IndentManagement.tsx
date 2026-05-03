import React, { useState } from 'react';
import { Indent, Bid, Trip } from '../types/logistics';
import { Plus, Search, FileText, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface IndentManagementProps {
  indents: Indent[];
  onAddIndent: (indent: Indent) => void;
  onUpdateIndent: (indent: Indent) => void;
  onAddTrip: (trip: Trip) => void;
}

export const IndentManagement: React.FC<IndentManagementProps> = ({
  indents,
  onAddIndent,
  onUpdateIndent,
  onAddTrip,
}) => {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [expandedIndentId, setExpandedIndentId] = useState<string | null>(null);

  // New Indent Create Form State
  const [newIndentId, setNewIndentId] = useState(`IND-${Math.floor(1000 + Math.random() * 9000)}`);
  const [customer, setCustomer] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [weight, setWeight] = useState<number>(0);
  const [pickupDate, setPickupDate] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  // Add Bid Form State per Indent
  const [bidIndentId, setBidIndentId] = useState<string | null>(null);
  const [vendorName, setVendorName] = useState('');
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidVehicleNo, setBidVehicleNo] = useState('');
  const [bidDriverName, setBidDriverName] = useState('');
  const [bidRemarks, setBidRemarks] = useState('');

  const filteredIndents = indents.filter(i =>
    i.id.toLowerCase().includes(search.toLowerCase()) ||
    i.customer.toLowerCase().includes(search.toLowerCase()) ||
    i.origin.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateIndent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !origin || !destination) return;

    const indent: Indent = {
      id: newIndentId,
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

    onAddIndent(indent);
    setIsAddOpen(false);
    // Reset inputs
    setNewIndentId(`IND-${Math.floor(1000 + Math.random() * 9000)}`);
    setCustomer('');
    setOrigin('');
    setDestination('');
    setCargoType('');
    setWeight(0);
    setPickupDate('');
    setVehicleType('');
  };

  const handleCreateBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidIndentId || !vendorName || !bidAmount) return;

    const indent = indents.find(i => i.id === bidIndentId);
    if (!indent) return;

    const newBid: Bid = {
      id: `BID-${Math.floor(1000 + Math.random() * 9000)}`,
      vendorName,
      amount: bidAmount,
      vehicleNo: bidVehicleNo,
      driverName: bidDriverName,
      remarks: bidRemarks,
      status: 'Pending',
    };

    const updated: Indent = {
      ...indent,
      status: 'Bidding Active',
      bids: [...indent.bids, newBid],
    };

    onUpdateIndent(updated);
    setBidIndentId(null);
    setVendorName('');
    setBidAmount(0);
    setBidVehicleNo('');
    setBidDriverName('');
    setBidRemarks('');
  };

  const handleAcceptBid = (indent: Indent, bidId: string) => {
    const chosenBid = indent.bids.find(b => b.id === bidId);
    if (!chosenBid) return;

    // Reject other bids & Accept the chosen one
    const updatedBids: Bid[] = indent.bids.map(b => ({
      ...b,
      status: b.id === bidId ? 'Accepted' : 'Rejected',
    }));

    const updatedIndent: Indent = {
      ...indent,
      status: 'Assigned',
      bids: updatedBids,
    };

    onUpdateIndent(updatedIndent);

    // Prompt automatic Dispatch / Trip Creation
    const trip: Trip = {
      id: `TRP-${Math.floor(10000 + Math.random() * 90000)}`,
      vehicleNo: chosenBid.vehicleNo || 'TBD-XX-XXXX',
      driverName: chosenBid.driverName || 'TBD Driver',
      origin: indent.origin,
      destination: indent.destination,
      status: 'Dispatched',
      startDate: indent.pickupDate || new Date().toISOString().split('T')[0],
      expectedDelivery: 'TBD Date',
      cargoType: indent.cargoType,
      cargoWeight: indent.weight,
      customer: indent.customer,
      expenses: { fuel: 0, toll: 0, misc: 0, driverAdvance: 0 },
      revenue: chosenBid.amount,
      currentLocation: indent.origin,
      milestones: [
        { time: new Date().toLocaleTimeString(), location: indent.origin, status: 'Trip Consignment Assigned from Bidding & Ready', completed: true },
        { time: 'Waiting', location: indent.destination, status: 'Estimated Destination Point Arrival', completed: false }
      ],
    };

    onAddTrip(trip);
  };

  const handleRejectBid = (indent: Indent, bidId: string) => {
    const updatedBids: Bid[] = indent.bids.map(b => ({
      ...b,
      status: b.id === bidId ? 'Rejected' : b.status,
    }));

    const updatedIndent: Indent = {
      ...indent,
      bids: updatedBids,
    };

    onUpdateIndent(updatedIndent);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Indent & Vendor Bidding</h1>
          <p className="text-xs text-gray-500 mt-1">Manage active indents, review incoming vendor quotes, and assign bookings</p>
        </div>
        <button
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer"
        >
          <Plus size={18} /> Add New Indent Demand
        </button>
      </div>

      {/* Form Overlay Section for Creating New Indents */}
      {isAddOpen && (
        <form onSubmit={handleCreateIndent} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 border-b border-gray-100 pb-2 mb-1">
            <h3 className="text-sm font-bold text-gray-800">Post New Transport Demand Indent</h3>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Indent Reference ID</label>
            <input
              type="text"
              value={newIndentId}
              readOnly
              className="mt-1 w-full p-2 bg-gray-50 border border-gray-200 text-xs font-medium rounded-lg text-gray-400 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Client / Customer</label>
            <input
              type="text"
              required
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="e.g. Reliance Retail"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Cargo Type</label>
            <input
              type="text"
              required
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              placeholder="e.g. Household Appliances"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Source City</label>
            <input
              type="text"
              required
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. Vadodara Hub"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Destination City</label>
            <input
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Pune Hub"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Total Net Weight (MT)</label>
            <input
              type="number"
              required
              value={weight || ''}
              onChange={(e) => setWeight(Number(e.target.value))}
              placeholder="e.g. 18"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Target Pickup Date</label>
            <input
              type="date"
              required
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-700">Preferred Truck / Vehicle</label>
            <input
              type="text"
              required
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              placeholder="e.g. Container 32FT"
              className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
            />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 mt-1.5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition cursor-pointer shadow-sm"
            >
              Confirm Indent Posting
            </button>
          </div>
        </form>
      )}

      {/* Indents List Action & Search Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search active indents or clients..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-full text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
          />
        </div>
      </div>

      {/* Core Lists Display & Bidding Interactivity */}
      <div className="space-y-4">
        {filteredIndents.map((indent) => {
          const isExpanded = expandedIndentId === indent.id;
          return (
            <div key={indent.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:border-indigo-100 transition duration-200">
              <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold rounded">
                      {indent.id}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 leading-none">{indent.customer}</h3>
                    <span
                      className={`px-2 py-0.5 border text-xs font-bold rounded-full ${
                        indent.status === 'Open'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : indent.status === 'Bidding Active'
                          ? 'bg-blue-50 border-blue-200 text-blue-800'
                          : 'bg-gray-100 border-gray-200 text-gray-500'
                      }`}
                    >
                      {indent.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">
                    Pickup Depot: {indent.origin} &rarr; Distribution DC: {indent.destination}
                  </p>
                  <p className="text-[11px] text-gray-400">
                    Expected Date: {indent.pickupDate} • Cargo: {indent.cargoType} • Vehicle: {indent.vehicleType} ({indent.weight} MT)
                  </p>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                  <button
                    onClick={() => setBidIndentId(indent.id)}
                    className="px-3.5 py-1.5 border border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-indigo-700 text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Bid / Send Quote
                  </button>
                  <button
                    onClick={() => setExpandedIndentId(isExpanded ? null : indent.id)}
                    className="p-1.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 rounded-lg transition cursor-pointer"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>
              </div>

              {/* Advanced Vendor Bidding List Expansion Panel */}
              {isExpanded && (
                <div className="p-4 bg-gray-50/50 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-gray-800 tracking-wide">
                      Incoming Vendor Quotes / Bids ({indent.bids.length})
                    </h4>
                  </div>
                  <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white overflow-hidden">
                    {indent.bids.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-500 flex flex-col items-center">
                        <FileText className="text-gray-300 mb-1" size={24} />
                        No vendor bidding proposals submitted yet.
                      </div>
                    ) : (
                      indent.bids.map((bid) => (
                        <div key={bid.id} className="p-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900">{bid.vendorName}</span>
                              <span
                                className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${
                                  bid.status === 'Accepted'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : bid.status === 'Rejected'
                                    ? 'bg-red-50 border-red-200 text-red-800'
                                    : 'bg-gray-50 border-gray-200 text-gray-600'
                                }`}
                              >
                                {bid.status}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-indigo-700 mt-1">Amount: ₹{bid.amount.toLocaleString()}</p>
                            <p className="text-[11px] text-gray-500">
                              Vehicle Attached: {bid.vehicleNo || 'Not Assigned'} • Driver: {bid.driverName || 'N/A'}
                            </p>
                            {bid.remarks && <p className="text-[11px] text-gray-500 italic mt-0.5">Note: "{bid.remarks}"</p>}
                          </div>
                          {indent.status !== 'Assigned' && bid.status === 'Pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleAcceptBid(indent, bid.id)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
                              >
                                <CheckCircle2 size={12} /> Accept & Start Trip
                              </button>
                              <button
                                onClick={() => handleRejectBid(indent, bid.id)}
                                className="p-1.5 border border-gray-200 hover:bg-red-50 hover:border-red-100 hover:text-red-700 text-gray-400 rounded-lg cursor-pointer transition"
                                title="Reject this quote bid"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Bid Form Popup Drawer/Modal */}
      {bidIndentId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
          <form onSubmit={handleCreateBid} className="bg-white max-w-md w-full p-6 rounded-xl border border-gray-200 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">
              Submit Fleet Vendor Bid Quote (Indent ID: {bidIndentId})
            </h3>
            <div>
              <label className="text-xs font-bold text-gray-700">Vendor / Company Name</label>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="e.g. Arsh Express Fleet"
                className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Bidding Quote Amount (₹)</label>
              <input
                type="number"
                required
                value={bidAmount || ''}
                onChange={(e) => setBidAmount(Number(e.target.value))}
                placeholder="e.g. 35000"
                className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Vehicle Allocated</label>
                <input
                  type="text"
                  required
                  value={bidVehicleNo}
                  onChange={(e) => setBidVehicleNo(e.target.value)}
                  placeholder="e.g. HR 38 Q 1121"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Allocated Driver Name</label>
                <input
                  type="text"
                  required
                  value={bidDriverName}
                  onChange={(e) => setBidDriverName(e.target.value)}
                  placeholder="e.g. Santosh"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Any Special Remarks</label>
              <input
                type="text"
                value={bidRemarks}
                onChange={(e) => setBidRemarks(e.target.value)}
                placeholder="e.g. Transit in 2 days guaranteed"
                className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setBidIndentId(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 font-bold transition cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-white rounded-lg text-xs transition shadow-sm cursor-pointer"
              >
                Submit Bid Quote
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
