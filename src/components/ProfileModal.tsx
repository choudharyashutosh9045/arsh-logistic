import React, { useState, useEffect } from 'react';
import { X, User, Save, Camera } from 'lucide-react';
import { AdminProfile } from '../types/profile';

interface ProfileModalProps {
  profile: AdminProfile;
  onSave: (profile: AdminProfile) => void;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ profile, onSave, onClose }) => {
  const [name, setName] = useState(profile.name);
  const [role, setRole] = useState(profile.role);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [department, setDepartment] = useState(profile.department);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');

  useEffect(() => {
    setName(profile.name);
    setRole(profile.role);
    setEmail(profile.email);
    setPhone(profile.phone);
    setDepartment(profile.department);
    setAvatarUrl(profile.avatarUrl || '');
  }, [profile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, role, email, phone, department, avatarUrl: avatarUrl || undefined });
    onClose();
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const initials = (name || 'A').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 overflow-y-auto">
      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Edit Admin Profile
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Update your personal information and role</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg cursor-pointer transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
            <div className="relative flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-2 border-blue-100" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-extrabold flex items-center justify-center border-2 border-blue-100">
                  {initials}
                </div>
              )}
              <label className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition" title="Upload photo">
                <Camera size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">Profile Picture</h4>
              <p className="text-xs text-gray-500 mt-0.5">Click the camera icon to upload a photo (JPG/PNG)</p>
              {avatarUrl && (
                <button type="button" onClick={() => setAvatarUrl('')} className="text-[11px] text-red-600 hover:underline mt-1 cursor-pointer">
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-700">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rajesh Sharma"
                className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 hover:border-gray-300 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Designation / Role *</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Operations Manager"
                className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 hover:border-gray-300 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Department / Branch</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Head Office - Haridwar"
                className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 hover:border-gray-300 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@arshlogistics.in"
                className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 hover:border-gray-300 transition"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="mt-1 w-full p-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 hover:border-gray-300 transition"
              />
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-800">
            💾 Your profile is saved locally in your browser and will persist across sessions.
          </div>
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer">
            Cancel
          </button>
          <button type="submit" className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition shadow-sm cursor-pointer">
            <Save size={14} /> Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};
