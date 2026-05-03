import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { OrderTracking } from './components/OrderTracking';
import { TripManagement } from './components/TripManagement';
import { IndentManagement } from './components/IndentManagement';
import { FleetMaster } from './components/FleetMaster';
import { Accounts } from './components/Accounts';
import { ClientPortal } from './components/ClientPortal';
import { ProfileModal } from './components/ProfileModal';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { AdminProfile, defaultProfile } from './types/profile';
import { User, DEFAULT_FOUNDER, Permission } from './types/auth';

import {
  initialTrips,
  initialIndents,
  initialDrivers,
  initialVehicles,
  initialInvoices,
  initialParties
} from './data/mockData';
import { Trip, Indent, Driver, Vehicle, Invoice, Party } from './types/logistics';

export default function App() {
  // ───────────────── AUTH STATE ─────────────────
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('arsh_users');
      const parsed: User[] = saved ? JSON.parse(saved) : [];
      // Ensure founder always exists
      const hasFounder = parsed.some(u => u.isFounder);
      return hasFounder ? parsed : [DEFAULT_FOUNDER, ...parsed];
    } catch {
      return [DEFAULT_FOUNDER];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('arsh_current_user_id');
      if (!saved) return null;
      const list = JSON.parse(localStorage.getItem('arsh_users') || '[]') as User[];
      const found = (list.length ? list : [DEFAULT_FOUNDER]).find(u => u.id === saved);
      return found && found.isActive ? found : null;
    } catch {
      return null;
    }
  });

  // Persist users + session
  useEffect(() => {
    try {
      localStorage.setItem('arsh_users', JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('arsh_current_user_id', currentUser.id);
      } else {
        localStorage.removeItem('arsh_current_user_id');
      }
    } catch {
      // ignore
    }
  }, [currentUser]);

  // Keep currentUser in sync when user record changes (e.g. perms updated)
  useEffect(() => {
    if (!currentUser) return;
    const fresh = users.find(u => u.id === currentUser.id);
    if (fresh && JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
      if (!fresh.isActive) {
        setCurrentUser(null);
      } else {
        setCurrentUser(fresh);
      }
    }
  }, [users, currentUser]);

  const handleLogin = (username: string, password: string): boolean => {
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );
    if (!user) return false;
    if (!user.isActive) {
      alert('Your account has been deactivated. Please contact the administrator.');
      return false;
    }
    const updated: User = { ...user, lastLogin: new Date().toISOString() };
    setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
    setCurrentUser(updated);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const addUser = (u: User) => setUsers(prev => [u, ...prev]);
  const updateUser = (u: User) => setUsers(prev => prev.map(x => (x.id === u.id ? u : x)));
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  // ───────────────── APP STATE ─────────────────
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [indents, setIndents] = useState<Indent[]>(initialIndents);
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [parties, setParties] = useState<Party[]>(initialParties);

  // Admin profile (mirrored from currentUser)
  const profile: AdminProfile = useMemo(() => {
    if (!currentUser) return defaultProfile;
    return {
      name: currentUser.fullName,
      role: currentUser.role.toUpperCase() + ' Access',
      email: currentUser.email,
      phone: currentUser.phone || '',
      department: currentUser.isFounder ? 'Founder / Owner' : 'Staff Member',
      avatarUrl: undefined,
    };
  }, [currentUser]);

  const setProfile = (newProfile: AdminProfile) => {
    if (!currentUser) return;
    updateUser({
      ...currentUser,
      fullName: newProfile.name,
      email: newProfile.email,
      phone: newProfile.phone,
    });
  };

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const addParty = (newParty: Party) => setParties([newParty, ...parties]);
  const updateParty = (updatedParty: Party) =>
    setParties(parties.map(p => (p.id === updatedParty.id ? updatedParty : p)));
  const deleteParty = (id: string) => setParties(parties.filter(p => p.id !== id));

  const addTrip = (newTrip: Trip) => setTrips([newTrip, ...trips]);
  const updateTrip = (updatedTrip: Trip) =>
    setTrips(trips.map(t => (t.id === updatedTrip.id ? updatedTrip : t)));
  const deleteTrip = (id: string) => setTrips(trips.filter(t => t.id !== id));

  const addIndent = (newIndent: Indent) => setIndents([newIndent, ...indents]);
  const updateIndent = (updatedIndent: Indent) =>
    setIndents(indents.map(i => (i.id === updatedIndent.id ? updatedIndent : i)));

  const addDriver = (newDriver: Driver) => setDrivers([newDriver, ...drivers]);
  const deleteDriver = (id: string) => setDrivers(drivers.filter(d => d.id !== id));

  const addVehicle = (newVehicle: Vehicle) => setVehicles([newVehicle, ...vehicles]);
  const deleteVehicle = (id: string) => setVehicles(vehicles.filter(v => v.id !== id));

  const addInvoice = (newInvoice: Invoice) => setInvoices([newInvoice, ...invoices]);
  const approveInvoice = (id: string, updateData?: Partial<Invoice>) =>
    setInvoices(invoices.map(i => (i.id === id ? { ...i, ...(updateData || { status: 'Paid' as const }) } : i)));

  // ───────────────── PERMISSION CHECK ─────────────────
  const can = (perm: Permission): boolean => !!currentUser?.permissions.includes(perm);

  // If current tab not allowed, redirect to first allowed tab
  useEffect(() => {
    if (!currentUser) return;
    if (!can(activeTab as Permission)) {
      const firstAllowed = currentUser.permissions[0];
      if (firstAllowed) setActiveTab(firstAllowed);
    }
  }, [currentUser, activeTab]);

  // ───────────────── RENDER ─────────────────
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const NoAccess = () => (
    <div className="bg-white p-12 rounded-xl border border-amber-200 shadow-sm text-center max-w-lg mx-auto">
      <div className="inline-flex p-3 bg-amber-50 border border-amber-200 rounded-2xl mb-3">
        <svg className="text-amber-600 w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-12a9 9 0 110 18 9 9 0 010-18zm0 0v6" />
        </svg>
      </div>
      <h2 className="text-lg font-extrabold text-gray-900">Access Denied</h2>
      <p className="text-xs text-gray-500 mt-1">
        You don't have permission to view this page. Please ask the Founder Admin to grant access.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row bg-slate-50 min-h-screen text-slate-800 antialiased font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Header
          activeTab={activeTab}
          profile={profile}
          onEditProfile={() => setProfileModalOpen(true)}
          onLogout={handleLogout}
        />

        <main className="p-4 md:p-6 lg:p-8 flex-1">
          {activeTab === 'dashboard' && (can('dashboard') ? (
            <Dashboard
              trips={trips}
              indents={indents}
              drivers={drivers}
              vehicles={vehicles}
              invoices={invoices}
              setActiveTab={setActiveTab}
              setSearchTerm={setSearchTerm}
            />
          ) : <NoAccess />)}

          {activeTab === 'tracking' && (can('tracking') ? (
            <OrderTracking trips={trips} searchTerm={searchTerm} onUpdateTrip={updateTrip} />
          ) : <NoAccess />)}

          {activeTab === 'trips' && (can('trips') ? (
            <TripManagement
              trips={trips}
              drivers={drivers}
              vehicles={vehicles}
              onAddTrip={addTrip}
              onUpdateTrip={updateTrip}
              onDeleteTrip={deleteTrip}
            />
          ) : <NoAccess />)}

          {activeTab === 'indents' && (can('indents') ? (
            <IndentManagement
              indents={indents}
              onAddIndent={addIndent}
              onUpdateIndent={updateIndent}
              onAddTrip={addTrip}
            />
          ) : <NoAccess />)}

          {activeTab === 'fleet' && (can('fleet') ? (
            <FleetMaster
              drivers={drivers}
              vehicles={vehicles}
              onAddDriver={addDriver}
              onAddVehicle={addVehicle}
              onDeleteDriver={deleteDriver}
              onDeleteVehicle={deleteVehicle}
            />
          ) : <NoAccess />)}

          {activeTab === 'accounts' && (can('accounts') ? (
            <Accounts
              invoices={invoices}
              trips={trips}
              parties={parties}
              onAddInvoice={addInvoice}
              onApproveInvoice={approveInvoice}
              onAddParty={addParty}
              onUpdateParty={updateParty}
              onDeleteParty={deleteParty}
            />
          ) : <NoAccess />)}

          {activeTab === 'portal' && (can('portal') ? (
            <ClientPortal
              indents={indents}
              trips={trips}
              onAddIndent={addIndent}
              setActiveTab={setActiveTab}
              setSearchTerm={setSearchTerm}
            />
          ) : <NoAccess />)}

          {activeTab === 'users' && (can('users') ? (
            <UserManagement
              users={users}
              currentUser={currentUser}
              onAddUser={addUser}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
            />
          ) : <NoAccess />)}
        </main>
      </div>

      {profileModalOpen && (
        <ProfileModal
          profile={profile}
          onSave={setProfile}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
