export interface AdminProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  department: string;
  avatarUrl?: string;
}

export const defaultProfile: AdminProfile = {
  name: 'Admin Staff',
  role: 'Management Desk',
  email: 'admin@arshlogistics.in',
  phone: '+91 99999 27421',
  department: 'Head Office - Haridwar',
};
