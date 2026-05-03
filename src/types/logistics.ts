export interface Trip {
  id: string;
  vehicleNo: string;
  driverName: string;
  origin: string;
  destination: string;
  status: 'In Transit' | 'Completed' | 'Delayed' | 'Dispatched';
  startDate: string;
  expectedDelivery: string;
  cargoType: string;
  cargoWeight: number; // in tons
  customer: string;
  expenses: {
    fuel: number;
    toll: number;
    misc: number;
    driverAdvance: number;
  };
  revenue: number;
  podUrl?: string;
  currentLocation: string;
  milestones: {
    time: string;
    location: string;
    status: string;
    completed: boolean;
  }[];
  // Shipment details (matching invoice format)
  shipmentDate?: string;
  lrNo?: string;
  cnNumber?: string;
  invoiceNo?: string;
  pkgs?: number;
  weightKgs?: number;
  dateOfArrival?: string;
  dateOfDelivery?: string;
  truckType?: string;
}

export interface Indent {
  id: string;
  customer: string;
  origin: string;
  destination: string;
  cargoType: string;
  weight: number;
  pickupDate: string;
  vehicleType: string;
  status: 'Open' | 'Bidding Active' | 'Bidding Closed' | 'Assigned' | 'Cancelled';
  bids: Bid[];
}

export interface Bid {
  id: string;
  vendorName: string;
  amount: number;
  vehicleNo: string;
  driverName: string;
  remarks: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
}

export interface Driver {
  id: string;
  name: string;
  licenseNo: string;
  phone: string;
  pan: string;
  status: 'Available' | 'On Trip' | 'On Leave';
  vehicleAssigned?: string;
}

export interface Vehicle {
  id: string;
  vehicleNo: string;
  model: string;
  capacity: number; // in tons
  type: string;
  status: 'Active' | 'Under Maintenance' | 'Idle';
  branch: string;
}

export interface Party {
  id: string;
  name: string;
  address: string;
  gstin: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

export interface InvoiceLineItem {
  sNo: number;
  shipmentDate: string;
  lrNo: string;
  destination: string;
  cnNumber: string;
  truckNo: string;
  invoiceNo: string;
  pkgs: number;
  weightKgs: number;
  dateOfArrival: string;
  dateOfDelivery: string;
  truckType: string;
  freightAmt: number;
  toPointChg: number;
  unloadingChg: number;
  srcDet: number;
  dstDet: number;
  totalAmt: number;
}

export interface Invoice {
  id: string;
  freightBillNo: string;
  tripId: string;
  // Bill To
  customer: string;
  customerAddress: string;
  customerGSTIN: string;
  fromLocation: string;
  // Dates
  invoiceDate: string;
  dueDate: string;
  createdDate: string;
  // Line items (shipments)
  lineItems: InvoiceLineItem[];
  // Totals
  totalAmount: number;
  totalInWords: string;
  netAmount: number; // alias of totalAmount
  // Bank & Company details
  panNo: string;
  gstNo: string;
  stateCode: string;
  bankName: string;
  accountName: string;
  accountNo: string;
  ifsCode: string;
  // Payment tracking
  amountPaid: number;
  balanceAmount: number;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue';
  paymentMode?: string;
  transactionId?: string;
}
