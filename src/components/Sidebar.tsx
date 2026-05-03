import React from 'react';
import { Truck, Home, Navigation, ClipboardList, Shield, CreditCard, Layout, Users, LogOut } from 'lucide-react';
import { Permission, User } from '../types/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
  const allLinks: { id: Permission; name: string; icon: any }[] = [
    { id: 'dashboard', name: 'Control Dashboard', icon: Home },
    { id: 'tracking', name: 'Live Cargo Tracking', icon: Navigation },
    { id: 'trips', name: 'Trip Management', icon: Truck },
    { id: 'indents', name: 'Indent & Bidding', icon: ClipboardList },
    { id: 'fleet', name: 'Fleet & Operators', icon: Shield },
    { id: 'accounts', name: 'Accounts & Finance', icon: CreditCard },
    { id: 'portal', name: 'Client Desk', icon: Layout },
    { id: 'users', name: 'User Management', icon: Users },
  ];

  // Filter to only links the user has permission for
  const links = allLinks.filter(l => currentUser.permissions.includes(l.id));

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 lg:min-h-screen border-r border-slate-800 flex flex-col justify-between select-none">
      <div className="p-5 flex flex-col gap-1 flex-1">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-4 mb-3">
          <div className="bg-white rounded-xl p-1 shadow-lg shadow-blue-500/20 flex-shrink-0">
            <img src="/arsh-logo.png" alt="Arsh Logistics" className="h-12 w-12 object-contain rounded-lg" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-wide leading-none">ARSH LOGISTICS</h2>
            <p className="text-[9px] text-orange-400 font-bold uppercase tracking-wider mt-1">Global Transport Solutions</p>
          </div>
        </div>

        <nav className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible py-2 gap-1.5 scrollbar-none">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                    : 'hover:bg-slate-800/70 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400'}`} />
                {link.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-5 border-t border-slate-800/80 space-y-3">
        <div className="bg-slate-800/40 border border-slate-700/40 p-3 rounded-xl hidden lg:block">
          <h4 className="text-[11px] font-bold text-white flex items-center gap-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span> {currentUser.fullName}
          </h4>
          <p className="text-[10px] text-slate-400 mt-1 capitalize">{currentUser.role} Access</p>
          <p className="text-[10px] text-slate-500">@{currentUser.username}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm('Are you sure you want to sign out?')) {
              onLogout();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </aside>
  );
};
