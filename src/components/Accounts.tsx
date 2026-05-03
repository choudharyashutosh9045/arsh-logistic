import React, { useState } from 'react';
import { Invoice, InvoiceLineItem, Trip, Party } from '../types/logistics';
import { Plus, Search, CheckCircle2, Camera, UploadCloud, Printer, Eye, X, Trash2, UserPlus, Users, Edit2 } from 'lucide-react';
import { numberToWords } from '../utils/numberToWords';
import { InvoicePrint } from './InvoicePrint';

interface AccountsProps {
  invoices: Invoice[];
  trips: Trip[];
  parties: Party[];
  onAddInvoice: (inv: Invoice) => void;
  onApproveInvoice: (id: string, updateData?: Partial<Invoice>) => void;
  onDeleteInvoice: (id: string) => void;
  onAddParty: (party: Party) => void;
  onUpdateParty: (party: Party) => void;
  onDeleteParty: (id: string) => void;
}

const emptyLine = (sNo: number): InvoiceLineItem => ({
  sNo,
  shipmentDate: '',
  lrNo: '',
  destination: '',
  cnNumber: '',
  truckNo: '',
  invoiceNo: '',
  pkgs: 0,
  weightKgs: 0,
  dateOfArrival: '',
  dateOfDelivery: '',
  truckType: '',
  freightAmt: 0,
  toPointChg: 0,
  unloadingChg: 0,
  srcDet: 0,
  dstDet: 0,
  totalAmt: 0,
});

const computeRowTotal = (li: InvoiceLineItem): number =>
  (li.freightAmt || 0) +
  (li.toPointChg || 0) +
  (li.unloadingChg || 0) +
  (li.srcDet || 0) +
  (li.dstDet || 0);

export const Accounts: React.FC<AccountsProps> = ({
  invoices,
  trips,
  parties,
  onAddInvoice,
  onApproveInvoice,
  onDeleteInvoice,
  onAddParty,
  onUpdateParty,
  onDeleteParty,
}) => {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrMessage, setOcrMessage] = useState('');

  // Customer / Header form state
  const [freightBillNo, setFreightBillNo] = useState(`2025/26/${String(invoices.length + 40).padStart(3, '0')}`);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [customer, setCustomer] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');

  // Bank & Company details (defaulted from photo)
  const [panNo, setPanNo] = useState('HOBPD5470P');
  const [gstNo, setGstNo] = useState('05HOBPD5470P1ZM');
  const [stateCode, setStateCode] = useState('05');
  const [bankName, setBankName] = useState('ICICI BANK');
  const [accountName, setAccountName] = useState('ARSH LOGISTICS');
  const [accountNo, setAccountNo] = useState('364205500521');
  const [ifsCode, setIfsCode] = useState('ICIC0003642');

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([emptyLine(1)]);

  // Payment settle modal state
  const [settleInvoice, setSettleInvoice] = useState<Invoice | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>('Online');
  const [transactionId, setTransactionId] = useState<string>('');
  const [amountReceived, setAmountReceived] = useState<number>(0);

  // View invoice modal
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  // Party Master Modal
  const [partyManagerOpen, setPartyManagerOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [pName, setPName] = useState('');
  const [pAddress, setPAddress] = useState('');
  const [pGstin, setPGstin] = useState('');
  const [pContact, setPContact] = useState('');
  const [pPhone, setPPhone] = useState('');
  const [pEmail, setPEmail] = useState('');

  const filteredInvoices = invoices.filter(i =>
    i.id.toLowerCase().includes(search.toLowerCase()) ||
    i.customer.toLowerCase().includes(search.toLowerCase()) ||
    i.freightBillNo.toLowerCase().includes(search.toLowerCase())
  );

  // Show all trips — ek trip pe multiple invoices bhi ban sakti hain
  const activeTripsNoInvoice = trips;

  // Auto-recompute totals
  const totalAmount = lineItems.reduce((acc, li) => acc + computeRowTotal(li), 0);
  const totalInWords = numberToWords(totalAmount);

  const handleSelectParty = (partyId: string) => {
    setSelectedPartyId(partyId);
    if (partyId === '__new__') {
      // Open party manager in add-new mode
      openPartyAddNew();
      setSelectedPartyId('');
      return;
    }
    const p = parties.find(party => party.id === partyId);
    if (p) {
      setCustomer(p.name);
      setCustomerAddress(p.address);
      setCustomerGSTIN(p.gstin);
    } else {
      setCustomer('');
      setCustomerAddress('');
      setCustomerGSTIN('');
    }
  };

  const updateLineItem = (idx: number, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(prev =>
      prev.map((li, i) => {
        if (i !== idx) return li;
        const next = { ...li, [field]: value };
        next.totalAmt = computeRowTotal(next);
        return next;
      })
    );
  };

  const addLineItem = () => {
    setLineItems(prev => [...prev, emptyLine(prev.length + 1)]);
  };

  const removeLineItem = (idx: number) => {
    setLineItems(prev => prev.filter((_, i) => i !== idx).map((li, i) => ({ ...li, sNo: i + 1 })));
  };

  const resetForm = () => {
    setFreightBillNo(`2025/26/${String(invoices.length + 41).padStart(3, '0')}`);
    setSelectedTripId('');
    setSelectedPartyId('');
    setCustomer('');
    setCustomerAddress('');
    setCustomerGSTIN('');
    setFromLocation('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setLineItems([emptyLine(1)]);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || lineItems.length === 0) return;

    const invoiceId = `INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInv: Invoice = {
      id: invoiceId,
      freightBillNo,
      tripId: selectedTripId,
      customer,
      customerAddress,
      customerGSTIN,
      fromLocation,
      invoiceDate,
      dueDate,
      createdDate: new Date().toISOString().split('T')[0],
      lineItems: lineItems.map(li => ({
        ...li,
        invoiceNo: li.invoiceNo || invoiceId,
        totalAmt: computeRowTotal(li),
      })),
      totalAmount,
      totalInWords,
      netAmount: totalAmount,
      panNo,
      gstNo,
      stateCode,
      bankName,
      accountName,
      accountNo,
      ifsCode,
      amountPaid: 0,
      balanceAmount: totalAmount,
      status: 'Pending',
    };

    onAddInvoice(newInv);
    setIsAddOpen(false);
    resetForm();
  };

  const handleSimulateOCR = () => {
    setOcrScanning(true);
    setOcrMessage('Checking scanned document...');
    setTimeout(() => {
      setOcrMessage('Extracting PAN & Bank Details... Complete!');
      setTimeout(() => {
        setOcrMessage('Verified and logged successfully.');
        setOcrScanning(false);
      }, 1200);
    }, 1200);
  };

  const openSettleModal = (inv: Invoice) => {
    setSettleInvoice(inv);
    setAmountReceived(inv.balanceAmount);
  };

  const handleMarkSettled = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleInvoice) return;

    const totalNewPaid = settleInvoice.amountPaid + amountReceived;
    const newBalance = settleInvoice.totalAmount - totalNewPaid;

    let status: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue' = 'Pending';
    if (newBalance <= 0) status = 'Paid';
    else if (totalNewPaid > 0) status = 'Partially Paid';

    onApproveInvoice(settleInvoice.id, {
      amountPaid: totalNewPaid,
      balanceAmount: newBalance < 0 ? 0 : newBalance,
      status,
      paymentMode,
      transactionId,
    });

    setSettleInvoice(null);
    setPaymentMode('Online');
    setTransactionId('');
    setAmountReceived(0);
  };

  const handlePrintInvoice = (inv: Invoice) => {
    setViewInvoice(inv);
    // Defer print to next tick so the dialog renders first
    setTimeout(() => {
      const node = document.getElementById('printable-invoice');
      if (!node) return;
      const w = window.open('', '_blank', 'width=1200,height=850');
      if (!w) return;
      const origin = window.location.origin;
      w.document.write(`<!DOCTYPE html><html><head><title>${inv.freightBillNo} - ARSH LOGISTICS</title><base href="${origin}/" />`);
      // Inline tailwind base + project styles
      const styles = Array.from(document.styleSheets)
        .map(ss => {
          try {
            return Array.from(ss.cssRules).map(r => r.cssText).join('\n');
          } catch {
            return '';
          }
        })
        .join('\n');
      w.document.write(`<style>${styles}
        @page { size: A4 landscape; margin: 0; }
        html { height: fit-content !important; overflow: hidden !important; }
        body { 
          margin: 0 !important; 
          padding: 0 !important; 
          background: #fff !important; 
          height: fit-content !important;
          overflow: hidden !important;
          -webkit-print-color-adjust: exact !important; 
          print-color-adjust: exact !important; 
        }
        #printable-invoice { 
          width: 100% !important; 
          max-width: 100% !important; 
          page-break-after: avoid !important;
          page-break-before: avoid !important;
          page-break-inside: avoid !important;
          break-after: avoid !important;
        }
        .print-wrap { 
          width: 100%; 
          height: fit-content !important;
          overflow: hidden !important;
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        * { box-sizing: border-box; }
      </style>`);
      w.document.write('</head><body><div class="print-wrap">');
      w.document.write(node.outerHTML);
      w.document.write('</div></body></html>');
      w.document.close();
      w.focus();

      // Wait for logo + all images to load before printing
      const triggerPrint = () => {
        const imgs = Array.from(w.document.images);
        if (imgs.length === 0) {
          w.print();
          setTimeout(() => w.close(), 1000);
          return;
        }
        let pending = imgs.length;
        const onDone = () => {
          pending--;
          if (pending <= 0) {
            setTimeout(() => {
              w.print();
              setTimeout(() => w.close(), 1000);
            }, 300);
          }
        };
        imgs.forEach(img => {
          if (img.complete && img.naturalHeight !== 0) {
            onDone();
          } else {
            img.addEventListener('load', onDone);
            img.addEventListener('error', onDone);
          }
        });
      };
      // Slight delay to let DOM settle
      setTimeout(triggerPrint, 400);
    }, 150);
  };

  // Auto-prefill when a trip is selected — user sirf freight amounts fill karega
  const onSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    const t = trips.find(tr => tr.id === tripId);
    if (!t) return;
    setFromLocation(t.origin);

    // Auto-fill customer from trip if no party selected
    if (!customer && t.customer) {
      setCustomer(t.customer);
    }

    const today = new Date(t.startDate || Date.now());
    const fmtDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const deliveryDate = t.expectedDelivery
      ? (() => {
          const d = new Date(t.expectedDelivery);
          return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        })()
      : fmtDate;

    setLineItems([
      {
        sNo: 1,
        shipmentDate: fmtDate,
        lrNo: t.lrNo || '',
        destination: t.destination,
        cnNumber: t.cnNumber || '',
        truckNo: t.vehicleNo,
        invoiceNo: t.invoiceNo || '',
        pkgs: t.pkgs || 0,
        weightKgs: t.weightKgs || (t.cargoWeight ? t.cargoWeight * 1000 : 0),
        dateOfArrival: deliveryDate,
        dateOfDelivery: deliveryDate,
        truckType: t.truckType || t.cargoType || '',
        // ── Freight fields: user fills these ──
        freightAmt: 0,
        toPointChg: 0,
        unloadingChg: 0,
        srcDet: 0,
        dstDet: 0,
        totalAmt: 0,
      }
    ]);
  };

  // Party Master handlers
  const openPartyAddNew = () => {
    setEditingParty(null);
    setPName('');
    setPAddress('');
    setPGstin('');
    setPContact('');
    setPPhone('');
    setPEmail('');
    setPartyManagerOpen(true);
  };

  const openPartyEdit = (p: Party) => {
    setEditingParty(p);
    setPName(p.name);
    setPAddress(p.address);
    setPGstin(p.gstin);
    setPContact(p.contactPerson || '');
    setPPhone(p.phone || '');
    setPEmail(p.email || '');
    setPartyManagerOpen(true);
  };

  const handleSaveParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pAddress) return;
    if (editingParty) {
      const updated: Party = {
        ...editingParty,
        name: pName,
        address: pAddress,
        gstin: pGstin,
        contactPerson: pContact,
        phone: pPhone,
        email: pEmail,
      };
      onUpdateParty(updated);
      // Refresh prefilled invoice fields if same party selected
      if (selectedPartyId === updated.id) {
        setCustomer(updated.name);
        setCustomerAddress(updated.address);
        setCustomerGSTIN(updated.gstin);
      }
    } else {
      const newParty: Party = {
        id: `PTY-${Math.floor(100 + Math.random() * 900)}`,
        name: pName,
        address: pAddress,
        gstin: pGstin,
        contactPerson: pContact,
        phone: pPhone,
        email: pEmail,
      };
      onAddParty(newParty);
      // Auto-select the newly added party
      setSelectedPartyId(newParty.id);
      setCustomer(newParty.name);
      setCustomerAddress(newParty.address);
      setCustomerGSTIN(newParty.gstin);
    }
    setPartyManagerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Financials & Invoicing Platform</h1>
          <p className="text-xs text-gray-500 mt-1">Generate professional freight invoices in the official ARSH LOGISTICS format.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openPartyAddNew}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            <Users size={16} /> Party Master ({parties.length})
          </button>
          <button
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer"
          >
            <Plus size={18} /> Generate Freight Bill
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Total Freight Sales</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹{invoices.reduce((acc, i) => acc + i.totalAmount, 0).toLocaleString()}
          </h3>
          <p className="text-[10px] text-blue-600 font-medium mt-1">Cumulative Billed Freight</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Receivables</span>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">
            ₹{invoices.reduce((acc, i) => acc + i.balanceAmount, 0).toLocaleString()}
          </h3>
          <p className="text-[10px] text-amber-600 font-medium mt-1">Pending payments from clients</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Paid Invoices</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
            {invoices.filter(i => i.status === 'Paid').length}
          </h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Settled count</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">Saved Parties</span>
          <h3 className="text-2xl font-extrabold text-indigo-600 mt-1">{parties.length}</h3>
          <p className="text-[10px] text-indigo-600 font-medium mt-1">Customer master records</p>
        </div>
      </div>

      {/* OCR Verification Tool */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 p-5 rounded-xl border border-blue-200/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-blue-100/80 rounded-xl text-blue-700 border border-blue-200">
            <Camera size={26} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 leading-tight">Advanced OCR Verification System</h3>
            <p className="text-xs text-gray-600 mt-1">Scan and automatically parse bank checks, PAN cards, and legal entity details.</p>
          </div>
        </div>
        <button
          onClick={handleSimulateOCR}
          disabled={ocrScanning}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-blue-50 border border-blue-200 text-blue-700 hover:border-blue-300 font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-75 cursor-pointer"
        >
          {ocrScanning ? (
            <span className="flex items-center gap-1.5">
              <UploadCloud size={16} className="animate-bounce" /> {ocrMessage || 'Scanning...'}
            </span>
          ) : (
            <>Scan Bank Detail Doc</>
          )}
        </button>
      </div>

      {/* INVOICE GENERATION FORM */}
      {isAddOpen && (
        <form onSubmit={handleCreateInvoice} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-gray-900">Generate ARSH LOGISTICS Freight Bill</h3>
              <p className="text-xs text-gray-500">Select a saved party from dropdown OR add a new one</p>
            </div>
            <button type="button" onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* HEADER ROW: Bill To + Freight Bill */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-slate-50/30">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase">To, (Bill To Customer)</h4>
                <button
                  type="button"
                  onClick={openPartyAddNew}
                  className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
                >
                  <UserPlus size={11} /> Add New Party
                </button>
              </div>

              {/* Party Dropdown - PRIMARY */}
              <div>
                <label className="text-xs font-bold text-gray-700">Select Saved Party</label>
                <div className="flex gap-2 mt-1">
                  <select
                    value={selectedPartyId}
                    onChange={(e) => handleSelectParty(e.target.value)}
                    className="flex-1 p-2 border border-blue-200 bg-blue-50/30 rounded-lg text-xs hover:border-blue-300 focus:border-blue-500 outline-none transition font-medium"
                  >
                    <option value="">-- Select existing party from dropdown --</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.gstin})
                      </option>
                    ))}
                    <option value="__new__">➕ Add New Party...</option>
                  </select>
                  {selectedPartyId && selectedPartyId !== '__new__' && (
                    <button
                      type="button"
                      onClick={() => {
                        const p = parties.find(party => party.id === selectedPartyId);
                        if (p) openPartyEdit(p);
                      }}
                      className="px-2 py-1 border border-gray-200 hover:bg-gray-50 hover:text-blue-600 text-gray-600 rounded-lg cursor-pointer transition"
                      title="Edit selected party"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Select party once → details auto-fill below. No need to retype every time.
                </p>
              </div>

              {/* Auto-filled (read-only style) party details */}
              <div className={`space-y-2.5 p-3 rounded-lg border ${customer ? 'bg-white border-emerald-100' : 'bg-gray-50/50 border-dashed border-gray-200'}`}>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value.toUpperCase())}
                    placeholder="Auto-fills when party is selected"
                    className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer Address</label>
                  <textarea
                    required
                    rows={2}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Auto-fills when party is selected"
                    className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Customer GSTIN</label>
                  <input
                    type="text"
                    required
                    value={customerGSTIN}
                    onChange={(e) => setCustomerGSTIN(e.target.value.toUpperCase())}
                    placeholder="Auto-fills when party is selected"
                    className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700">From Location</label>
                <input
                  type="text"
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="e.g. Haridwar Hub"
                  className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-slate-50/30">
                <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase">Freight Bill Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Freight Bill No</label>
                    <input
                      type="text"
                      required
                      value={freightBillNo}
                      onChange={(e) => setFreightBillNo(e.target.value)}
                      placeholder="2025/26/038"
                      className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Link Trip (optional)</label>
                    <select
                      value={selectedTripId}
                      onChange={(e) => onSelectTrip(e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">Manual entry (bina trip ke)</option>
                      {activeTripsNoInvoice.map((t) => (
                        <option key={t.id} value={t.id}>{t.id} — {t.customer} ({t.origin} → {t.destination})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Invoice Date</label>
                    <input
                      type="date"
                      required
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-slate-50/30">
                <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase">Bank &amp; Company Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">PAN No.</label>
                    <input type="text" value={panNo} onChange={(e) => setPanNo(e.target.value.toUpperCase())} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">GST No.</label>
                    <input type="text" value={gstNo} onChange={(e) => setGstNo(e.target.value.toUpperCase())} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">State Code</label>
                    <input type="text" value={stateCode} onChange={(e) => setStateCode(e.target.value)} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">Bank Name</label>
                    <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">Account Name</label>
                    <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-700">Account No</label>
                    <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] font-bold text-gray-700">IFS Code</label>
                    <input type="text" value={ifsCode} onChange={(e) => setIfsCode(e.target.value.toUpperCase())} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHIPMENT LINE ITEMS */}
          <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase">Shipment Line Items</h4>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition"
              >
                <Plus size={12} /> Add Shipment Row
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((li, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-blue-700">Shipment #{li.sNo}</span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Shipment Date</label>
                      <input type="text" value={li.shipmentDate} onChange={(e) => updateLineItem(idx, 'shipmentDate', e.target.value)} placeholder="MM/DD/YYYY" className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">LR No.</label>
                      <input type="text" value={li.lrNo} onChange={(e) => updateLineItem(idx, 'lrNo', e.target.value)} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Dest.</label>
                      <input type="text" value={li.destination} onChange={(e) => updateLineItem(idx, 'destination', e.target.value)} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">CN Number</label>
                      <input type="text" value={li.cnNumber} onChange={(e) => updateLineItem(idx, 'cnNumber', e.target.value)} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Truck No</label>
                      <input type="text" value={li.truckNo} onChange={(e) => updateLineItem(idx, 'truckNo', e.target.value)} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Invoice No</label>
                      <input type="text" value={li.invoiceNo} onChange={(e) => updateLineItem(idx, 'invoiceNo', e.target.value)} placeholder="auto" className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Pkgs</label>
                      <input type="number" value={li.pkgs || ''} onChange={(e) => updateLineItem(idx, 'pkgs', Number(e.target.value))} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Weight (Kgs)</label>
                      <input type="number" value={li.weightKgs || ''} onChange={(e) => updateLineItem(idx, 'weightKgs', Number(e.target.value))} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Date of Arrival</label>
                      <input type="text" value={li.dateOfArrival} onChange={(e) => updateLineItem(idx, 'dateOfArrival', e.target.value)} placeholder="MM/DD/YYYY" className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Date of Delivery</label>
                      <input type="text" value={li.dateOfDelivery} onChange={(e) => updateLineItem(idx, 'dateOfDelivery', e.target.value)} placeholder="MM/DD/YYYY" className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Truck Type</label>
                      <input type="text" value={li.truckType} onChange={(e) => updateLineItem(idx, 'truckType', e.target.value)} placeholder="19FT06 TYRE" className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Freight Amt(₹)</label>
                      <input type="number" value={li.freightAmt || ''} onChange={(e) => updateLineItem(idx, 'freightAmt', Number(e.target.value))} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">To Point Chg(₹)</label>
                      <input type="number" value={li.toPointChg || ''} onChange={(e) => updateLineItem(idx, 'toPointChg', Number(e.target.value))} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Unloading Chg(₹)</label>
                      <input type="number" value={li.unloadingChg || ''} onChange={(e) => updateLineItem(idx, 'unloadingChg', Number(e.target.value))} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Src Det (₹)</label>
                      <input type="number" value={li.srcDet || ''} onChange={(e) => updateLineItem(idx, 'srcDet', Number(e.target.value))} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600">Dst Det (₹)</label>
                      <input type="number" value={li.dstDet || ''} onChange={(e) => updateLineItem(idx, 'dstDet', Number(e.target.value))} className="mt-0.5 w-full p-1.5 border border-gray-200 rounded text-[11px] outline-none focus:border-blue-500 transition" />
                    </div>
                    <div className="col-span-2 md:col-span-2">
                      <label className="text-[10px] font-bold text-blue-700">Total Amt (auto)</label>
                      <input type="text" readOnly value={`₹${li.totalAmt.toFixed(2)}`} className="mt-0.5 w-full p-1.5 bg-blue-50 border border-blue-100 rounded text-[11px] font-bold text-blue-800 outline-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-slate-100 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="text-[11px] text-gray-600">Total in words (Rs.):</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{totalInWords}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-gray-600">Grand Total</p>
                <p className="text-xl font-extrabold text-blue-700">₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition cursor-pointer shadow-sm"
            >
              Generate &amp; Save Invoice
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice ID, freight bill no, or client name..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-full text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
          />
        </div>
      </div>

      {/* Main Invoices Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                <th className="p-4">Freight Bill</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Shipments</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Balance Payable</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No invoices generated yet.</td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold rounded">
                        {inv.freightBillNo}
                      </span>
                      <p className="text-[10px] text-gray-400 mt-1">{inv.id}</p>
                      <p className="text-[10px] text-gray-500">Date: {inv.invoiceDate}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-800">{inv.customer}</p>
                      <p className="text-[10px] text-gray-500">GSTIN: {inv.customerGSTIN}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-700 font-medium">{inv.lineItems.length} shipment(s)</p>
                      <p className="text-[10px] text-gray-500">{inv.lineItems[0]?.destination || '—'}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-extrabold text-gray-900">₹{inv.totalAmount.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-amber-600">₹{inv.balanceAmount.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Paid: ₹{inv.amountPaid.toLocaleString()}</p>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full font-bold border text-[11px] ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : inv.status === 'Partially Paid'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewInvoice(inv)}
                          className="p-1.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                          title="View invoice"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handlePrintInvoice(inv)}
                          className="p-1.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer transition"
                          title="Print invoice"
                        >
                          <Printer size={14} />
                        </button>
                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() => openSettleModal(inv)}
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer transition shadow-sm"
                          >
                            <CheckCircle2 size={12} /> Settle
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Delete invoice ${inv.freightBillNo}? This cannot be undone.`)) {
                              onDeleteInvoice(inv.id);
                            }
                          }}
                          className="p-1.5 bg-gray-50 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                          title="Delete invoice"
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

      {/* Settle Payment Modal */}
      {settleInvoice && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-50">
          <form onSubmit={handleMarkSettled} className="bg-white max-w-md w-full p-6 rounded-xl border border-gray-200 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2.5">
              <h3 className="text-sm font-bold text-gray-900">
                Register Payment ({settleInvoice.freightBillNo})
              </h3>
              <button type="button" onClick={() => setSettleInvoice(null)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block">Billed to Customer</label>
              <span className="text-sm font-bold text-gray-800">{settleInvoice.customer}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block">Total Bill</label>
                <span className="text-sm font-bold text-gray-800">₹{settleInvoice.totalAmount.toLocaleString()}</span>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block">Remaining Balance</label>
                <span className="text-sm font-extrabold text-amber-600">₹{settleInvoice.balanceAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700">Payment Mode</label>
                <select required value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition">
                  <option value="Online">Online Banking / UPI</option>
                  <option value="Bank Transfer">Bank Wire (NEFT/RTGS)</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Cash">Cash Receipt</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Transaction ID / Voucher Ref</label>
                <input type="text" required value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="e.g. TXN-9981881726" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700">Received Amount (₹)</label>
                <input type="number" required max={settleInvoice.balanceAmount} value={amountReceived || ''} onChange={(e) => setAmountReceived(Number(e.target.value))} placeholder={`Max ₹${settleInvoice.balanceAmount.toLocaleString()}`} className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs hover:border-gray-300 focus:border-blue-500 outline-none transition" />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-100">
              <button type="button" onClick={() => setSettleInvoice(null)} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition shadow-sm cursor-pointer">
                Commit Receipt
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Invoice View Modal with InvoicePrint */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1200px] max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-3 border-b border-gray-200 flex justify-between items-center z-10">
              <h3 className="text-sm font-bold text-gray-800">Invoice Preview - {viewInvoice.freightBillNo}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => handlePrintInvoice(viewInvoice)} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition cursor-pointer">
                  <Printer size={14} /> Print Full Page PDF
                </button>
                <button onClick={() => setViewInvoice(null)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg cursor-pointer transition">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-3 flex justify-center bg-slate-100">
              <InvoicePrint invoice={viewInvoice} />
            </div>
          </div>
        </div>
      )}

      {/* PARTY MASTER MODAL */}
      {partyManagerOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Party Master Records</h3>
                <p className="text-xs text-gray-500">Save customer details once - select from dropdown later</p>
              </div>
              <button onClick={() => setPartyManagerOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Add/Edit Form */}
              <form onSubmit={handleSaveParty} className="bg-slate-50/50 border border-gray-200 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase">
                  {editingParty ? `Edit Party: ${editingParty.id}` : 'Add New Party'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-700">Party / Company Name *</label>
                    <input type="text" required value={pName} onChange={(e) => setPName(e.target.value.toUpperCase())} placeholder="e.g. GRIVAA SPRINGS PRIVATE LTD." className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-700">Full Address *</label>
                    <textarea required rows={2} value={pAddress} onChange={(e) => setPAddress(e.target.value)} placeholder="Khasra no 135, Tansipur, Roorkee, Haridwar, Uttarakhand 247656" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition resize-none" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">GSTIN</label>
                    <input type="text" value={pGstin} onChange={(e) => setPGstin(e.target.value.toUpperCase())} placeholder="05AAICG4793P1ZV" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Contact Person</label>
                    <input type="text" value={pContact} onChange={(e) => setPContact(e.target.value)} placeholder="Accounts Dept." className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Phone</label>
                    <input type="text" value={pPhone} onChange={(e) => setPPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Email</label>
                    <input type="email" value={pEmail} onChange={(e) => setPEmail(e.target.value)} placeholder="accounts@company.com" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  {editingParty && (
                    <button type="button" onClick={() => { setEditingParty(null); setPName(''); setPAddress(''); setPGstin(''); setPContact(''); setPPhone(''); setPEmail(''); }} className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer">
                      Clear
                    </button>
                  )}
                  <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm cursor-pointer">
                    {editingParty ? 'Update Party' : 'Save New Party'}
                  </button>
                </div>
              </form>

              {/* Saved Parties List */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase mb-2">Saved Parties ({parties.length})</h4>
                {parties.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-xs text-gray-500">
                    No parties saved yet. Add your first one above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {parties.map((p) => (
                      <div key={p.id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-start hover:bg-slate-50/50 transition">
                        <div className="flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                              {p.id}
                            </span>
                            <h5 className="text-sm font-bold text-gray-900">{p.name}</h5>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1 leading-snug">{p.address}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[10px] text-gray-500">
                            <span><strong className="text-gray-700">GSTIN:</strong> {p.gstin || '—'}</span>
                            {p.contactPerson && <span><strong className="text-gray-700">Contact:</strong> {p.contactPerson}</span>}
                            {p.phone && <span>📞 {p.phone}</span>}
                            {p.email && <span>✉️ {p.email}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openPartyEdit(p)} className="p-1.5 border border-gray-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-gray-600 rounded-lg cursor-pointer transition" title="Edit">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => { if (confirm(`Delete party ${p.name}?`)) onDeleteParty(p.id); }} className="p-1.5 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-gray-400 rounded-lg cursor-pointer transition" title="Delete">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
