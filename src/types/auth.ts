export type Permission =
  | 'dashboard'
  | 'tracking'
  | 'trips'
  | 'indents'
  | 'fleet'
  | 'accounts'
  | 'portal'
  | 'users'; // user management (admin only)

export type UserRole = 'admin' | 'manager' | 'operator' | 'accountant' | 'viewer' | 'custom';

export interface User {
  id: string;
  username: string;
  password: string; // plain for demo; in real app hash this
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  isFounder?: boolean; // master admin - cannot be deleted
}

export const ALL_PERMISSIONS: { id: Permission; label: string; description: string }[] = [
  { id: 'dashboard', label: 'Control Dashboard', description: 'View KPIs and overview' },
  { id: 'tracking', label: 'Live Cargo Tracking', description: 'Track vehicles & update locations' },
  { id: 'trips', label: 'Trip Management', description: 'Create & manage shipment consignments' },
  { id: 'indents', label: 'Indent & Bidding', description: 'Manage indents and vendor bids' },
  { id: 'fleet', label: 'Fleet & Operators', description: 'Manage trucks and drivers' },
  { id: 'accounts', label: 'Accounts & Finance', description: 'Generate invoices, settle payments' },
  { id: 'portal', label: 'Client Desk', description: 'Customer portal access' },
  { id: 'users', label: 'User Management', description: 'Create/manage users (Admin only)' },
];

export const ROLE_PRESETS: Record<Exclude<UserRole, 'custom'>, Permission[]> = {
  admin: ['dashboard', 'tracking', 'trips', 'indents', 'fleet', 'accounts', 'portal', 'users'],
  manager: ['dashboard', 'tracking', 'trips', 'indents', 'fleet', 'accounts', 'portal'],
  operator: ['dashboard', 'tracking', 'trips', 'fleet'],
  accountant: ['dashboard', 'accounts', 'trips'],
  viewer: ['dashboard', 'tracking'],
};

export const DEFAULT_FOUNDER: User = {
  id: 'USR-FOUNDER',
  username: 'admin',
  password: 'admin123',
  fullName: 'Founder Admin',
  email: 'admin@arshlogistics.in',
  phone: '+91 99999 27421',
  role: 'admin',
  permissions: ROLE_PRESETS.admin,
  isActive: true,
  createdAt: new Date().toISOString().split('T')[0],
  isFounder: true,
};
