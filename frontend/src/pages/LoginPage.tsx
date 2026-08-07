import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role, User } from '../types';
import { AlertCircle, Lock, Mail, ArrowRight, UserCircle2 } from 'lucide-react';

const DEMO_ACCOUNTS: User[] = [
  { id: '1', email: 'admin@resqverse.local', name: 'Admin User', role: 'administrator' },
  { id: '2', email: 'commander@resqverse.local', name: 'Sarah Connor', role: 'incident_commander' },
  { id: '3', email: 'medical@resqverse.local', name: 'Dr. Gregory House', role: 'medical_coordinator' },
  { id: '4', email: 'logistics@resqverse.local', name: 'Bruce Wayne', role: 'logistics_manager' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simulate network delay for premium feel
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const demoUser = DEMO_ACCOUNTS.find(u => u.email === email);
    if (demoUser && password === 'password') {
      login(demoUser);
      navigate('/');
    } else {
      setError('Invalid credentials. Use a demo account below.');
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (user: User) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    login(user);
    navigate('/');
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h2>
        <p className="text-slate-400 font-medium">Authenticate to access the command center.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-fade-in shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <AlertCircle size={18} className="text-red-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-1.5">
            Operator Email
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
              <Mail size={18} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 backdrop-blur-sm sm:text-sm"
              placeholder="commander@resqverse.local"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-300">
              Passcode
            </label>
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-blue-400 transition-colors">
              Forgot passcode?
            </Link>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
              <Lock size={18} />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 backdrop-blur-sm sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center items-center gap-2 py-3 px-4 mt-2 border border-transparent rounded-xl text-sm font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0f18] focus:ring-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              Authorize Access
              <ArrowRight size={18} className="opacity-70 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800/80" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[#0a0f18] text-slate-500 font-medium">Or bypass with demo credentials</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              onClick={() => handleDemoLogin(account)}
              disabled={isLoading}
              className="group w-full flex items-center justify-between py-2.5 px-4 border border-slate-700/50 rounded-xl shadow-sm bg-slate-800/30 text-sm font-medium text-slate-300 hover:bg-slate-800/80 hover:border-slate-600 transition-all duration-200 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <UserCircle2 size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                <span className="truncate">{account.name}</span>
              </div>
              <span className="text-xs uppercase tracking-wider text-slate-500 font-bold bg-slate-900/50 px-2 py-1 rounded-md">
                {account.role.replace('_', ' ')}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-slate-500 font-medium">
        Don't have clearance?{' '}
        <Link to="/register" className="font-bold text-primary hover:text-blue-400 transition-colors">
          Request Access
        </Link>
      </div>
    </div>
  );
}
