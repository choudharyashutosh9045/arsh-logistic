import React, { useState, useRef, useEffect } from 'react';
import { Bell, Truck, Globe, User, ChevronDown, Edit2, LogOut, Mail, Phone } from 'lucide-react';
import { AdminProfile } from '../types/profile';

interface HeaderProps {
  activeTab: string;
  profile: AdminProfile;
  onEditProfile: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, profile, onEditProfile, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = (profile.name || 'A').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="bg-white h-16 px-6 flex items-center justify-between border-b border-gray-200/80 shadow-sm sticky top-0 z-40 select-none">
      <div className="flex items-center gap-2">
        <Truck className="text-blue-600 lg:hidden" size={24} />
        <span className="text-xs text-gray-400 capitalize hidden sm:inline font-medium">Pages / {activeTab}</span>
      </div>

      <div className="flex items-center gap-5">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-gray-100 rounded-lg">
          <Globe size={14} className="text-blue-600" />
          <span className="text-[11px] font-bold text-gray-600 tracking-wide uppercase">Fleet System</span>
        </div>

        <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg hover:text-gray-800 transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        {/* Profile dropdown trigger */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2.5 pl-2 border-l border-gray-100 hover:bg-gray-50 rounded-r-lg pr-2 py-1 transition cursor-pointer"
          >
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="h-9 w-9 rounded-xl object-cover border border-blue-100" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-extrabold flex items-center justify-center">
                {initials}
              </div>
            )}
            <div className="hidden sm:block text-left">
              <h4 className="text-xs font-extrabold text-gray-800 leading-tight">{profile.name}</h4>
              <p className="text-[10px] text-gray-400 font-semibold uppercase leading-tight mt-0.5">{profile.role}</p>
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 border-b border-gray-100 flex items-center gap-3">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} className="h-12 w-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-extrabold flex items-center justify-center border-2 border-white shadow-sm">
                    {initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-extrabold text-gray-900 truncate">{profile.name}</h4>
                  <p className="text-[11px] text-blue-700 font-semibold truncate">{profile.role}</p>
                  {profile.department && (
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">{profile.department}</p>
                  )}
                </div>
              </div>

              <div className="p-3 border-b border-gray-100 space-y-1.5 text-xs">
                {profile.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={12} className="text-gray-400 flex-shrink-0" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={12} className="text-gray-400 flex-shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
              </div>

              <div className="p-2">
                <button
                  onClick={() => {
                    setOpen(false);
                    onEditProfile();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition cursor-pointer"
                >
                  <Edit2 size={14} /> Edit My Profile
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-lg transition cursor-pointer"
                >
                  <User size={14} /> Account Settings
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    if (confirm('Are you sure you want to sign out?')) {
                      onLogout();
                    }
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer mt-1 border-t border-gray-100 pt-2"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
