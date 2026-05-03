import React from 'react';
import { Invoice } from '../types/logistics';

interface InvoicePrintProps {
  invoice: Invoice;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ invoice }) => {
  const fmt = (n: number) => n.toFixed(2);

  return (
    <div
      className="bg-white text-slate-800 font-sans w-full"
      id="printable-invoice"
      style={{ width: '100%', maxWidth: '1100px', minHeight: '760px', margin: '0 auto' }}
    >
      {/* Header dark navy strip - full width */}
      <div className="bg-[#0e1a3a] text-white flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-full h-[80px] w-[80px] flex items-center justify-center border-2 border-slate-200 flex-shrink-0 overflow-hidden p-1">
            <img src="/arsh-logo.png" alt="Arsh Logistics" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-[20px] font-extrabold tracking-wide leading-tight">ARSH LOGISTICS</h1>
            <p className="text-[11px] text-slate-200 leading-tight">Dehradun Road Oppo Power House,</p>
            <p className="text-[11px] text-slate-200 leading-tight">Near Sheriya co. Bhagwanpur, Distt- Haridwar (U.K.) 247661</p>
          </div>
        </div>
        <div className="text-[32px] font-extrabold tracking-[0.18em] mr-8">INVOICE</div>
      </div>

      <div className="p-6 space-y-4">
        {/* Bill To & Freight Bill row */}
        <div className="grid grid-cols-2 gap-5">
          <div className="border border-slate-300 rounded-md p-4">
            <p className="text-[12px] text-slate-700 mb-1">To,</p>
            <p className="font-bold text-slate-900 text-[13px]">{invoice.customer || '—'}</p>
            <p className="text-[11px] text-slate-700 leading-snug mt-1">{invoice.customerAddress || '—'}</p>
            <p className="text-[11px] text-slate-700 mt-2">
              <strong className="text-slate-900">GSTIN:</strong> {invoice.customerGSTIN || '—'}
            </p>
          </div>
          <div className="border border-slate-300 rounded-md p-4">
            <p className="font-bold text-[13px] text-slate-900">Freight Bill No: {invoice.freightBillNo || '—'}</p>
            <p className="text-[12px] text-slate-700 mt-2.5">Invoice Date: {invoice.invoiceDate || '—'}</p>
            <p className="text-[12px] text-slate-700 mt-1.5">Due Date: {invoice.dueDate || '—'}</p>
          </div>
        </div>

        <div>
          <p className="text-[11px] text-slate-700">From location: <strong>{invoice.fromLocation || '—'}</strong></p>
        </div>

        {/* Line Items table - full width */}
        <div className="border border-slate-300 rounded-md overflow-hidden">
          <table className="w-full text-[9px] border-collapse">
            <thead>
              <tr className="bg-[#0e1a3a] text-white text-[8.5px] uppercase">
                <th className="p-1.5 border border-[#0e1a3a]">S.<br />No</th>
                <th className="p-1.5 border border-[#0e1a3a]">Shipment<br />Date</th>
                <th className="p-1.5 border border-[#0e1a3a]">LR<br />No.</th>
                <th className="p-1.5 border border-[#0e1a3a]">Dest.</th>
                <th className="p-1.5 border border-[#0e1a3a]">CN<br />Number</th>
                <th className="p-1.5 border border-[#0e1a3a]">Truck No</th>
                <th className="p-1.5 border border-[#0e1a3a]">Invoice No</th>
                <th className="p-1.5 border border-[#0e1a3a]">Pkgs</th>
                <th className="p-1.5 border border-[#0e1a3a]">Weight<br />(Kgs)</th>
                <th className="p-1.5 border border-[#0e1a3a]">Date of<br />Arrival</th>
                <th className="p-1.5 border border-[#0e1a3a]">Date of<br />Delivery</th>
                <th className="p-1.5 border border-[#0e1a3a]">Truck<br />Type</th>
                <th className="p-1.5 border border-[#0e1a3a]">Freight<br />Amt(Rs.)</th>
                <th className="p-1.5 border border-[#0e1a3a]">To Point<br />Chg(Rs.)</th>
                <th className="p-1.5 border border-[#0e1a3a]">Unloading<br />Chg(Rs.)</th>
                <th className="p-1.5 border border-[#0e1a3a]">Src Det<br />(Rs.)</th>
                <th className="p-1.5 border border-[#0e1a3a]">Dst Det<br />(Rs.)</th>
                <th className="p-1.5 border border-[#0e1a3a]">Total<br />Amt(Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.length === 0 ? (
                <tr>
                  <td colSpan={18} className="p-4 text-center text-slate-400 border border-slate-200">No shipments added.</td>
                </tr>
              ) : (
                invoice.lineItems.map((li) => (
                  <tr key={li.sNo} className="text-center text-slate-800">
                    <td className="p-1.5 border border-slate-200">{li.sNo}</td>
                    <td className="p-1.5 border border-slate-200">{li.shipmentDate}</td>
                    <td className="p-1.5 border border-slate-200">{li.lrNo}</td>
                    <td className="p-1.5 border border-slate-200">{li.destination}</td>
                    <td className="p-1.5 border border-slate-200">{li.cnNumber}</td>
                    <td className="p-1.5 border border-slate-200">{li.truckNo}</td>
                    <td className="p-1.5 border border-slate-200">{li.invoiceNo}</td>
                    <td className="p-1.5 border border-slate-200">{li.pkgs || ''}</td>
                    <td className="p-1.5 border border-slate-200">{li.weightKgs || ''}</td>
                    <td className="p-1.5 border border-slate-200">{li.dateOfArrival}</td>
                    <td className="p-1.5 border border-slate-200">{li.dateOfDelivery}</td>
                    <td className="p-1.5 border border-slate-200">{li.truckType}</td>
                    <td className="p-1.5 border border-slate-200">{fmt(li.freightAmt)}</td>
                    <td className="p-1.5 border border-slate-200">{fmt(li.toPointChg)}</td>
                    <td className="p-1.5 border border-slate-200">{fmt(li.unloadingChg)}</td>
                    <td className="p-1.5 border border-slate-200">{fmt(li.srcDet)}</td>
                    <td className="p-1.5 border border-slate-200">{fmt(li.dstDet)}</td>
                    <td className="p-1.5 border border-slate-200 font-bold">{fmt(li.totalAmt)}</td>
                  </tr>
                ))
              )}
              <tr className="bg-slate-100 font-bold text-slate-900">
                <td colSpan={17} className="p-2 border border-slate-200 text-left">
                  Total in words (Rs.) : {invoice.totalInWords || 'Zero'}
                </td>
                <td className="p-2 border border-slate-200 text-center">{fmt(invoice.totalAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="text-[10px] text-slate-600 leading-snug">
          <p>Any changes or discrepancies should be highlighted within 5 working days else it would be considered final.</p>
          <p>Please send all remittance details to "arshlogistics2025@gmail.com".</p>
        </div>

        {/* Bank details + signatory */}
        <div className="grid grid-cols-2 gap-6 mt-4">
          <div className="border border-slate-300 rounded-md overflow-hidden self-start" style={{ maxWidth: '420px' }}>
            <div className="bg-[#0e1a3a] text-white p-1.5 text-center font-bold text-[12px]">
              Bank &amp; Company Details
            </div>
            <table className="w-full text-[11px] border-collapse">
              <tbody>
                <tr>
                  <td className="bg-slate-50 p-1.5 border border-slate-200 font-semibold w-[140px]">1. PAN No.</td>
                  <td className="p-1.5 border border-slate-200">{invoice.panNo}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 p-1.5 border border-slate-200 font-semibold">2. GST No.</td>
                  <td className="p-1.5 border border-slate-200">{invoice.gstNo}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 p-1.5 border border-slate-200 font-semibold">3. State Code</td>
                  <td className="p-1.5 border border-slate-200">{invoice.stateCode}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 p-1.5 border border-slate-200 font-semibold">4. Bank Name</td>
                  <td className="p-1.5 border border-slate-200">{invoice.bankName}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 p-1.5 border border-slate-200 font-semibold">5. Account Name</td>
                  <td className="p-1.5 border border-slate-200">{invoice.accountName}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 p-1.5 border border-slate-200 font-semibold">6. Account No</td>
                  <td className="p-1.5 border border-slate-200">{invoice.accountNo}</td>
                </tr>
                <tr>
                  <td className="bg-slate-50 p-1.5 border border-slate-200 font-semibold">7. IFS Code</td>
                  <td className="p-1.5 border border-slate-200">{invoice.ifsCode}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-end items-end pb-3">
            <p className="font-bold text-[12px] text-slate-900 mb-14">For ARSH LOGISTICS</p>
            <div className="border-t border-slate-400 w-60"></div>
            <p className="text-[11px] text-slate-700 mt-1">(Authorized Signatory)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
