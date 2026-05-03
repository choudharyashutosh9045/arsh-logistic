import React, { useState } from 'react';
import { User, Permission, UserRole, ALL_PERMISSIONS, ROLE_PRESETS } from '../types/auth';
import { Plus, Search, Edit2, Trash2, Shield, X, Eye, EyeOff, Copy, CheckCircle2, UserCheck, UserX, Crown } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showPassMap, setShowPassMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string>('');

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('operator');
  const [permissions, setPermissions] = useState<Permission[]>(ROLE_PRESETS.operator);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setFullName('');
    setEmail('');
    setPhone('');
    setRole('operator');
    setPermissions(ROLE_PRESETS.operator);
    setIsActive(true);
    setEditingUser(null);
  };

  const openAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setUsername(u.username);
    setPassword(u.password);
    setFullName(u.fullName);
    setEmail(u.email);
    setPhone(u.phone || '');
    setRole(u.role);
    setPermissions(u.permissions);
    setIsActive(u.isActive);
    setIsAddOpen(true);
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole !== 'custom') {
      setPermissions(ROLE_PRESETS[newRole]);
    }
  };

  const togglePermission = (perm: Permission) => {
    setPermissions(prev => {
      const has = prev.includes(perm);
      const next = has ? prev.filter(p => p !== perm) : [...prev, perm];
      // If diverging from preset → mark as custom
      const presetMatch = (Object.entries(ROLE_PRESETS) as [Exclude<UserRole, 'custom'>, Permission[]][]).find(
        ([, perms]) => perms.length === next.length && perms.every(p => next.includes(p))
      );
      if (presetMatch) {
        setRole(presetMatch[0]);
      } else {
        setRole('custom');
      }
      return next;
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let p = '';
    for (let i = 0; i < 10; i++) p += chars[Math.floor(Math.random() * chars.length)];
    setPassword(p);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !fullName) return;

    // Username uniqueness check
    const conflict = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.id !== editingUser?.id
    );
    if (conflict) {
      alert(`Username "${username}" already exists. Choose another.`);
      return;
    }

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        username,
        password,
        fullName,
        email,
        phone,
        role,
        permissions,
        isActive,
      });
    } else {
      const newUser: User = {
        id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
        username,
        password,
        fullName,
        email,
        phone,
        role,
        permissions,
        isActive,
        createdAt: new Date().toISOString().split('T')[0],
      };
      onAddUser(newUser);
    }
    setIsAddOpen(false);
    resetForm();
  };

  const handleDelete = (u: User) => {
    if (u.isFounder) {
      alert('The Founder Admin account cannot be deleted.');
      return;
    }
    if (u.id === currentUser.id) {
      alert("You can't delete your own account.");
      return;
    }
    if (confirm(`Permanently delete user "${u.fullName}"? They will no longer be able to log in.`)) {
      onDeleteUser(u.id);
    }
  };

  const toggleActive = (u: User) => {
    if (u.isFounder) {
      alert('The Founder Admin account cannot be deactivated.');
      return;
    }
    onUpdateUser({ ...u, isActive: !u.isActive });
  };

  const copyCredentials = (u: User) => {
    const text = `Login URL: ${window.location.origin}\nUsername: ${u.username}\nPassword: ${u.password}\nRole: ${u.role.toUpperCase()}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedId(u.id);
      setTimeout(() => setCopiedId(''), 1800);
    });
  };

  const filteredUsers = users.filter(
    u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Shield className="text-blue-600" size={22} /> User Management & Access Control
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Create users, set custom permissions, and share login credentials. Only the Founder Admin (you) can manage users.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shadow-sm cursor-pointer"
        >
          <Plus size={18} /> Create New User
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Users</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{users.length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Active</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">{users.filter(u => u.isActive).length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Admins</span>
          <h3 className="text-2xl font-extrabold text-blue-600 mt-1">{users.filter(u => u.role === 'admin').length}</h3>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Disabled</span>
          <h3 className="text-2xl font-extrabold text-red-500 mt-1">{users.filter(u => !u.isActive).length}</h3>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, name, email, or role..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg w-full text-xs hover:border-gray-300 focus:border-blue-500 transition outline-none"
          />
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase">
                <th className="p-4">User</th>
                <th className="p-4">Login Credentials</th>
                <th className="p-4">Role</th>
                <th className="p-4">Permissions</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No users match your search.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const showPass = !!showPassMap[u.id];
                  const isMe = u.id === currentUser.id;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-extrabold flex items-center justify-center flex-shrink-0">
                            {u.fullName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-bold text-gray-900">{u.fullName}</p>
                              {u.isFounder && <Crown size={12} className="text-amber-500" />}
                              {isMe && <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">YOU</span>}
                            </div>
                            <p className="text-[10px] text-gray-500">{u.email}</p>
                            {u.phone && <p className="text-[10px] text-gray-400">{u.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-xs"><span className="text-gray-500">User:</span> <strong className="font-mono text-gray-900">{u.username}</strong></p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-gray-500 text-xs">Pass:</span>
                          <strong className="font-mono text-gray-900 text-xs">
                            {showPass ? u.password : '•'.repeat(Math.min(u.password.length, 10))}
                          </strong>
                          <button
                            onClick={() => setShowPassMap({ ...showPassMap, [u.id]: !showPass })}
                            className="text-gray-400 hover:text-blue-600 cursor-pointer"
                            title={showPass ? 'Hide password' : 'Show password'}
                          >
                            {showPass ? <EyeOff size={11} /> : <Eye size={11} />}
                          </button>
                          <button
                            onClick={() => copyCredentials(u)}
                            className="text-gray-400 hover:text-blue-600 cursor-pointer"
                            title="Copy login details"
                          >
                            {copiedId === u.id ? <CheckCircle2 size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border capitalize ${
                          u.role === 'admin'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : u.role === 'manager'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                            : u.role === 'accountant'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : u.role === 'operator'
                            ? 'bg-orange-50 border-orange-200 text-orange-700'
                            : u.role === 'viewer'
                            ? 'bg-gray-50 border-gray-200 text-gray-700'
                            : 'bg-purple-50 border-purple-200 text-purple-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions.length === 0 ? (
                            <span className="text-[10px] text-gray-400 italic">No access</span>
                          ) : (
                            u.permissions.map(p => (
                              <span key={p} className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold capitalize">
                                {p}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={u.isFounder}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border transition ${
                            u.isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                          } ${u.isFounder ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                          title={u.isFounder ? 'Founder cannot be deactivated' : 'Click to toggle'}
                        >
                          {u.isActive ? <UserCheck size={11} /> : <UserX size={11} />}
                          {u.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEdit(u)}
                            className="p-1.5 bg-gray-50 border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition"
                            title="Edit user"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={u.isFounder || isMe}
                            className={`p-1.5 bg-gray-50 border border-gray-200 rounded-lg transition ${
                              u.isFounder || isMe
                                ? 'opacity-40 cursor-not-allowed text-gray-400'
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                            }`}
                            title={u.isFounder ? 'Founder cannot be deleted' : isMe ? "Can't delete yourself" : 'Delete user'}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50 overflow-y-auto">
          <form onSubmit={handleSave} className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center z-10">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingUser ? `Edit User: ${editingUser.fullName}` : 'Create New User Account'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set login credentials and choose what this user can access
                </p>
              </div>
              <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }} className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Identity */}
              <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/30 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase">User Identity</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-gray-700">Full Name *</label>
                    <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Rajesh Sharma" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Email *</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@arshlogistics.in" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Phone</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className="mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-500 transition" />
                  </div>
                </div>
              </div>

              {/* Login credentials */}
              <div className="border border-blue-200 rounded-xl p-4 bg-blue-50/20 space-y-3">
                <h4 className="text-xs font-bold text-blue-800 tracking-wider uppercase">Login Credentials (Share with User)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700">Username *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                      placeholder="e.g. rajesh_sharma"
                      disabled={editingUser?.isFounder}
                      className={`mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500 transition ${editingUser?.isFounder ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Password *</label>
                    <div className="flex gap-1 mt-1">
                      <input
                        type="text"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Set password"
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500 transition"
                      />
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="px-2.5 py-1 bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-[10px] font-bold rounded-lg cursor-pointer transition"
                        title="Generate random password"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">
                  💡 After saving, click the copy icon next to the user in the table to share their login link, username & password.
                </p>
              </div>

              {/* Role + Permissions */}
              <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/30 space-y-3">
                <h4 className="text-xs font-bold text-gray-700 tracking-wider uppercase">Access Role & Permissions</h4>
                <div>
                  <label className="text-xs font-bold text-gray-700">Preset Role</label>
                  <select
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    disabled={editingUser?.isFounder}
                    className={`mt-1 w-full p-2 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:border-blue-500 transition ${editingUser?.isFounder ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <option value="admin">Admin (Full Access)</option>
                    <option value="manager">Manager (Operations + Accounts)</option>
                    <option value="accountant">Accountant (Billing & Trips)</option>
                    <option value="operator">Operator (Trips & Tracking)</option>
                    <option value="viewer">Viewer (Read-only Dashboard + Tracking)</option>
                    <option value="custom">Custom (Manual Selection)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700">Specific Permissions (toggle to customize)</label>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                    {ALL_PERMISSIONS.map(p => {
                      const checked = permissions.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-start gap-2 p-2 border rounded-lg cursor-pointer transition ${
                            checked ? 'bg-blue-50/60 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'
                          } ${editingUser?.isFounder ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={editingUser?.isFounder}
                            onChange={() => togglePermission(p.id)}
                            className="mt-0.5 h-4 w-4 accent-blue-600"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-gray-800">{p.label}</p>
                            <p className="text-[10px] text-gray-500">{p.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-2 border-t border-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    disabled={editingUser?.isFounder}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 accent-emerald-600"
                  />
                  <span className="text-xs font-bold text-gray-700">Account Active (user can log in)</span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 transition cursor-pointer">
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg text-xs transition shadow-sm cursor-pointer">
                {editingUser ? 'Update User' : 'Create User Account'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
