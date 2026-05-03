import { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { OrderTracking } from './components/OrderTracking';
import { TripManagement } from './components/TripManagement';
import { FleetMaster } from './components/FleetMaster';
import { Accounts } from './components/Accounts';
import { ClientPortal } from './components/ClientPortal';
import { ProfileModal } from './components/ProfileModal';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { AdminProfile, defaultProfile } from './types/profile';
import { User, DEFAULT_FOUNDER, Permission } from './types/auth';
import {
  saveDoc,
  deleteDocById,
  subscribeToCollection,
  seedCollection,
} from './firebase';

import {
  initialTrips,
  initialDrivers,
  initialVehicles,
  initialInvoices,
  initialParties,
} from './data/mockData';
import { Trip, Driver, Vehicle, Invoice, Party } from './types/logistics';

// ── Loading state tracker ─────────────────────────────────────
const COLLECTIONS = ['users', 'trips', 'drivers', 'vehicles', 'invoices', 'parties'];

export default function App() {

  // ───────────────── LOADING ─────────────────
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});
  const allLoaded = COLLECTIONS.every((c) => loaded[c]);

  const markLoaded = (name: string) =>
    setLoaded((prev) => ({ ...prev, [name]: true }));

  // ───────────────── AUTH STATE ─────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('arsh_current_user') || 'null');
    } catch {
      return null;
    }
  });

  // Subscribe to users + seed founder on first launch
  useEffect(() => {
    const unsub = subscribeToCollection('users', (docs) => {
      const list = docs as User[];
      if (list.length === 0) {
        saveDoc('users', DEFAULT_FOUNDER);
      } else {
        setUsers(list);
      }
      markLoaded('users');
    });
    return () => unsub();
  }, []);

  // Keep currentUser in sync with Firestore
  useEffect(() => {
    if (!currentUser || users.length === 0) return;
    const fresh = users.find((u) => u.id === currentUser.id);
    if (!fresh) return;
    if (JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
      if (!fresh.isActive) {
        setCurrentUser(null);
        localStorage.removeItem('arsh_current_user');
      } else {
        setCurrentUser(fresh);
        localStorage.setItem('arsh_current_user', JSON.stringify(fresh));
      }
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('arsh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('arsh_current_user');
    }
  }, [currentUser]);

  const handleLogin = (username: string, password: string): boolean => {
    const user = users.find(
      (u) =>
        u.username.toLowerCase() === username.toLowerCase() &&
        u.password === password
    );
    if (!user) return false;
    if (!user.isActive) {
      alert('Your account has been deactivated. Please contact the administrator.');
      return false;
    }
    const updated: User = { ...user, lastLogin: new Date().toISOString() };
    saveDoc('users', updated);
    setCurrentUser(updated);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  const addUser = (u: User) => saveDoc('users', u);
  const updateUser = (u: User) => saveDoc('users', u);
  const deleteUser = (id: string) => deleteDocById('users', id);

  // ───────────────── TRIPS ─────────────────
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    seedCollection('trips', initialTrips).then(() => {
      const unsub = subscribeToCollection('trips', (docs) => {
        setTrips(docs as Trip[]);
        markLoaded('trips');
      });
      return () => unsub();
    });
  }, []);

  const addTrip = (t: Trip) => saveDoc('trips', t);
  const updateTrip = (t: Trip) => saveDoc('trips', t);
  const deleteTrip = (id: string) => deleteDocById('trips', id);

  // ───────────────── DRIVERS ─────────────────
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    seedCollection('drivers', initialDrivers).then(() => {
      const unsub = subscribeToCollection('drivers', (docs) => {
        setDrivers(docs as Driver[]);
        markLoaded('drivers');
      });
      return () => unsub();
    });
  }, []);

  const addDriver = (d: Driver) => saveDoc('drivers', d);
  const deleteDriver = (id: string) => deleteDocById('drivers', id);

  // ───────────────── VEHICLES ─────────────────
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  useEffect(() => {
    seedCollection('vehicles', initialVehicles).then(() => {
      const unsub = subscribeToCollection('vehicles', (docs) => {
        setVehicles(docs as Vehicle[]);
        markLoaded('vehicles');
      });
      return () => unsub();
    });
  }, []);

  const addVehicle = (v: Vehicle) => saveDoc('vehicles', v);
  const deleteVehicle = (id: string) => deleteDocById('vehicles', id);

  // ───────────────── INVOICES ─────────────────
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    seedCollection('invoices', initialInvoices).then(() => {
      const unsub = subscribeToCollection('invoices', (docs) => {
        setInvoices(docs as Invoice[]);
        markLoaded('invoices');
      });
      return () => unsub();
    });
  }, []);

  const addInvoice = (inv: Invoice) => saveDoc('invoices', inv);
  const approveInvoice = (id: string, updateData?: Partial<Invoice>) => {
    const inv = invoices.find((i) => i.id === id);
    if (inv) saveDoc('invoices', { ...inv, ...(updateData || { status: 'Paid' }) });
  };

  // ───────────────── PARTIES ─────────────────
  const [parties, setParties] = useState<Party[]>([]);

  useEffect(() => {
    seedCollection('parties', initialParties).then(() => {
      const unsub = subscribeToCollection('parties', (docs) => {
        setParties(docs as Party[]);
        markLoaded('parties');
      });
      return () => unsub();
    });
  }, []);

  const addParty = (p: Party) => saveDoc('parties', p);
  const updateParty = (p: Party) => saveDoc('parties', p);
  const deleteParty = (id: string) => deleteDocById('parties', id);

  // ───────────────── PROFILE ─────────────────
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

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

  // ───────────────── PERMISSION CHECK ─────────────────
  const can = (perm: Permission): boolean =>
    !!currentUser?.permissions.includes(perm);

  useEffect(() => {
    if (!currentUser) return;
    if (!can(activeTab as Permission)) {
      const firstAllowed = currentUser.permissions[0];
      if (firstAllowed) setActiveTab(firstAllowed);
    }
  }, [currentUser, activeTab]);

  // ───────────────── LOADING SCREEN ─────────────────
  if (!allLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold text-lg">Arsh Logistics</p>
          <p className="text-slate-400 text-sm mt-1">Loading data from cloud...</p>
        </div>
      </div>
    );
  }

  // ───────────────── LOGIN ─────────────────
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

  // ───────────────── RENDER ─────────────────
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
              indents={[]}
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
              indents={[]}
              trips={trips}
              onAddIndent={() => {}}
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
