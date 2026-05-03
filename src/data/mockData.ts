import { Trip, Indent, Driver, Vehicle, Invoice, Party } from '../types/logistics';

export const initialParties: Party[] = [
  {
    id: 'PTY-001',
    name: 'GRIVAA SPRINGS PRIVATE LTD.',
    address: 'Khasra no 135, Tansipur, Roorkee, Haridwar, Uttarakhand 247656',
    gstin: '05AAICG4793P1ZV',
    contactPerson: 'Accounts Dept.',
    phone: '+91 98123 45670',
    email: 'accounts@grivaa.in',
  },
  {
    id: 'PTY-002',
    name: 'AMAZON INDIA LOGISTICS',
    address: 'Brigade Gateway, Rajajinagar, Bangalore, Karnataka 560055',
    gstin: '29AAICA1234A1Z5',
    contactPerson: 'Vendor Payments',
    phone: '+91 80123 45678',
    email: 'vendor.payments@amazon.in',
  },
  {
    id: 'PTY-003',
    name: 'L&T CONSTRUCTION',
    address: 'Mount Poonamallee Road, Manapakkam, Chennai 600089',
    gstin: '33AAACL0140P1Z5',
    contactPerson: 'Logistics Cell',
    phone: '+91 44456 78901',
    email: 'logistics@lntecc.com',
  },
];

export const initialTrips: Trip[] = [
  {
    id: 'TRP-10024',
    vehicleNo: 'HR 38 X 4059',
    driverName: 'Ramesh Kumar',
    origin: 'Delhi Hub',
    destination: 'Mumbai DC',
    status: 'In Transit',
    startDate: '2026-03-22',
    expectedDelivery: '2026-03-26',
    cargoType: 'E-Commerce Retail',
    cargoWeight: 14,
    customer: 'Amazon India Logistics',
    expenses: {
      fuel: 12000,
      toll: 3500,
      misc: 1200,
      driverAdvance: 5000,
    },
    revenue: 48000,
    currentLocation: 'Jaipur Bypass',
    milestones: [
      { time: '2026-03-22 09:30 AM', location: 'Delhi Hub', status: 'Dispatched from Hub', completed: true },
      { time: '2026-03-23 04:15 PM', location: 'Jaipur Bypass', status: 'Transit in Jaipur', completed: true },
      { time: 'Waiting', location: 'Ahmedabad Checkpoint', status: 'Upcoming Route Check', completed: false },
      { time: 'Waiting', location: 'Mumbai DC', status: 'Destination Delivery', completed: false }
    ],
  },
  {
    id: 'TRP-10025',
    vehicleNo: 'MH 12 CY 8901',
    driverName: 'Santosh Singh',
    origin: 'Mumbai DC',
    destination: 'Bangalore Hub',
    status: 'Dispatched',
    startDate: '2026-03-24',
    expectedDelivery: '2026-03-27',
    cargoType: 'Pharmaceutical Products',
    cargoWeight: 8.5,
    customer: 'Sun Pharma Ltd.',
    expenses: {
      fuel: 9500,
      toll: 2800,
      misc: 800,
      driverAdvance: 3000,
    },
    revenue: 35500,
    currentLocation: 'Navi Mumbai Hub',
    milestones: [
      { time: '2026-03-24 10:15 AM', location: 'Mumbai DC', status: 'Trip Started', completed: true },
      { time: 'Waiting', location: 'Kolhapur Expressway', status: 'Pending Route Passage', completed: false },
      { time: 'Waiting', location: 'Bangalore Hub', status: 'Destination Delivery', completed: false }
    ],
  },
  {
    id: 'TRP-10022',
    vehicleNo: 'DL 1M K 3210',
    driverName: 'Anil Gupta',
    origin: 'Gurugram Warehousing',
    destination: 'Chennai Port',
    status: 'Completed',
    startDate: '2026-03-18',
    expectedDelivery: '2026-03-21',
    cargoType: 'Industrial Machineries',
    cargoWeight: 22,
    customer: 'L&T Construction',
    expenses: {
      fuel: 22000,
      toll: 6500,
      misc: 2100,
      driverAdvance: 10000,
    },
    revenue: 95000,
    currentLocation: 'Chennai Port Delivery Yard',
    milestones: [
      { time: '2026-03-18 07:00 AM', location: 'Gurugram Warehousing', status: 'Loaded & Ready', completed: true },
      { time: '2026-03-19 11:30 PM', location: 'Hyderabad Hub', status: 'Transit at Hyderabad', completed: true },
      { time: '2026-03-21 03:45 PM', location: 'Chennai Port Delivery Yard', status: 'Successfully Unloaded', completed: true }
    ],
    podUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80'
  },
];

export const initialIndents: Indent[] = [
  {
    id: 'IND-3051',
    customer: 'Reliance Retail',
    origin: 'Ahmedabad Warehouse',
    destination: 'Pune Distribution Center',
    cargoType: 'Electronics & Gadgets',
    weight: 6.2,
    pickupDate: '2026-03-25',
    vehicleType: 'TATA Ultra 22FT',
    status: 'Open',
    bids: [
      {
        id: 'BID-901',
        vendorName: 'Global Fleet Operators',
        amount: 28500,
        vehicleNo: 'GJ 01 XX 7823',
        driverName: 'Vikram Yadav',
        remarks: 'Direct non-stop service available.',
        status: 'Pending',
      }
    ],
  },
  {
    id: 'IND-3052',
    customer: 'Apollo Tyres',
    origin: 'Vadodara Plant',
    destination: 'Delhi Depot',
    cargoType: 'Automotive Spares',
    weight: 18,
    pickupDate: '2026-03-27',
    vehicleType: 'Container 32FT MX',
    status: 'Bidding Active',
    bids: [
      {
        id: 'BID-902',
        vendorName: 'North Star Logistics',
        amount: 62000,
        vehicleNo: 'DL 01 AA 2109',
        driverName: 'Jaspreet Singh',
        remarks: 'New BS-VI container truck.',
        status: 'Pending',
      },
      {
        id: 'BID-903',
        vendorName: 'Arsh Express Fleet',
        amount: 59000,
        vehicleNo: 'HR 55 W 1122',
        driverName: 'Surender Pal',
        remarks: 'Discounted price, premium drivers.',
        status: 'Pending',
      }
    ],
  }
];

export const initialDrivers: Driver[] = [
  {
    id: 'DRV-001',
    name: 'Ramesh Kumar',
    licenseNo: 'DL14 20120192834',
    phone: '+91 98765 43210',
    pan: 'ABCDE1234F',
    status: 'On Trip',
    vehicleAssigned: 'HR 38 X 4059',
  },
  {
    id: 'DRV-002',
    name: 'Jaspreet Singh',
    licenseNo: 'PB02 20180918231',
    phone: '+91 99887 76655',
    pan: 'FGHIJ5678K',
    status: 'Available',
  },
  {
    id: 'DRV-003',
    name: 'Anil Gupta',
    licenseNo: 'KA03 20150912111',
    phone: '+91 91234 56789',
    pan: 'LMNOP9012Q',
    status: 'Available',
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'VEH-001',
    vehicleNo: 'HR 38 X 4059',
    model: 'TATA LPT 1918',
    capacity: 14,
    type: 'Open Body',
    status: 'Active',
    branch: 'Delhi Head Office',
  },
  {
    id: 'VEH-002',
    vehicleNo: 'MH 12 CY 8901',
    model: 'Mahindra Blazo 25',
    capacity: 22,
    type: 'Container 32FT',
    status: 'Active',
    branch: 'Mumbai DC',
  },
  {
    id: 'VEH-003',
    vehicleNo: 'KA 51 F 2233',
    model: 'BharatBenz 2823R',
    capacity: 18,
    type: 'Reefer Truck',
    status: 'Idle',
    branch: 'Bangalore Hub',
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'INV-1001',
    freightBillNo: '2025/26/038',
    tripId: 'TRP-10022',
    customer: 'GRIVAA SPRINGS PRIVATE LTD.',
    customerAddress: 'Khasra no 135, Tansipur, Roorkee, Haridwar, Uttarakhand 247656',
    customerGSTIN: '05AAICG4793P1ZV',
    fromLocation: 'Haridwar Hub',
    invoiceDate: '2026-02-05',
    dueDate: '2026-02-06',
    createdDate: '2026-02-05',
    lineItems: [
      {
        sNo: 1,
        shipmentDate: '02/05/2026',
        lrNo: 'LR-3382',
        destination: 'Roorkee',
        cnNumber: 'CN-9012',
        truckNo: 'UK 08 BG 4521',
        invoiceNo: 'INV-1001',
        pkgs: 24,
        weightKgs: 5800,
        dateOfArrival: '02/05/2026',
        dateOfDelivery: '02/05/2026',
        truckType: '19FT06 TYRE',
        freightAmt: 18500,
        toPointChg: 1200,
        unloadingChg: 800,
        srcDet: 0,
        dstDet: 500,
        totalAmt: 21000
      }
    ],
    totalAmount: 21000,
    totalInWords: 'Twenty One Thousand Only',
    netAmount: 21000,
    panNo: 'HOBPD5470P',
    gstNo: '05HOBPD5470P1ZM',
    stateCode: '05',
    bankName: 'ICICI BANK',
    accountName: 'ARSH LOGISTICS',
    accountNo: '364205500521',
    ifsCode: 'ICIC0003642',
    amountPaid: 21000,
    balanceAmount: 0,
    status: 'Paid',
    paymentMode: 'Bank Transfer'
  },
  {
    id: 'INV-1002',
    freightBillNo: '2025/26/039',
    tripId: 'TRP-10024',
    customer: 'Amazon India Logistics',
    customerAddress: 'Brigade Gateway, Rajajinagar, Bangalore, Karnataka 560055',
    customerGSTIN: '29AAICA1234A1Z5',
    fromLocation: 'Delhi Hub',
    invoiceDate: '2026-03-22',
    dueDate: '2026-04-20',
    createdDate: '2026-03-22',
    lineItems: [
      {
        sNo: 1,
        shipmentDate: '03/22/2026',
        lrNo: 'LR-3401',
        destination: 'Mumbai',
        cnNumber: 'CN-9120',
        truckNo: 'HR 38 X 4059',
        invoiceNo: 'INV-1002',
        pkgs: 42,
        weightKgs: 14000,
        dateOfArrival: '03/26/2026',
        dateOfDelivery: '03/26/2026',
        truckType: '32FT MX',
        freightAmt: 48000,
        toPointChg: 2200,
        unloadingChg: 1500,
        srcDet: 600,
        dstDet: 500,
        totalAmt: 52800
      }
    ],
    totalAmount: 52800,
    totalInWords: 'Fifty Two Thousand Eight Hundred Only',
    netAmount: 52800,
    panNo: 'HOBPD5470P',
    gstNo: '05HOBPD5470P1ZM',
    stateCode: '05',
    bankName: 'ICICI BANK',
    accountName: 'ARSH LOGISTICS',
    accountNo: '364205500521',
    ifsCode: 'ICIC0003642',
    amountPaid: 15000,
    balanceAmount: 37800,
    status: 'Partially Paid',
    paymentMode: 'Cheque'
  }
];


