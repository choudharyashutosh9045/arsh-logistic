import React, { useState } from 'react';
import { Truck, User, Lock, LogIn, ShieldAlert } from 'lucide-react';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username.trim(), password);
    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4 select-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(255,107,31,0.1),transparent_50%)]"></div>

      <div className="relative w-full max-w-md">
        {/* Logo header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-white p-2 rounded-2xl shadow-2xl shadow-blue-900/40 mb-4">
            <img src="/arsh-logo.png" alt="Arsh Logistics" className="h-20 w-20 object-contain rounded-xl" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-wide">ARSH LOGISTICS</h1>
          <p className="text-orange-400 text-xs font-bold uppercase tracking-[0.3em] mt-1">Global Transport Solutions</p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-8 space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-slate-900">Sign in to your account</h2>
              <p className="text-xs text-slate-500 mt-1">Access the fleet & operations control panel</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg">
                  <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                  <span className="font-semibold">{error}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700">Username</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    className="pl-10 pr-4 py-2.5 w-full border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl bg-slate-50/50 text-sm outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="pl-10 pr-16 py-2.5 w-full border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl bg-slate-50/50 text-sm outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 transition cursor-pointer"
              >
                <LogIn size={16} /> Sign In to Dashboard
              </button>
            </form>

            <div className="border-t border-slate-100 pt-4">
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-3">
                <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Default Founder Login</p>
                <p className="text-[11px] text-amber-800 mt-1">
                  Username: <strong className="font-mono">admin</strong> &nbsp;|&nbsp; Password: <strong className="font-mono">admin123</strong>
                </p>
                <p className="text-[10px] text-amber-700 mt-1.5">
                  Change password from User Management after first login.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50/80 border-t border-slate-100 p-3 text-center">
            <p className="text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1">
              <Truck size={10} className="text-blue-600" /> Powered by Arsh Logistics Pulse System
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 mt-6">
          © {new Date().getFullYear()} Arsh Logistics — All Rights Reserved
        </p>
      </div>
    </div>
  );
};
