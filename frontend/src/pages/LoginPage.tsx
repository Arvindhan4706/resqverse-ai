import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Role, User } from '../types';
import { AlertCircle } from 'lucide-react';

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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In mock mode, we just check if it matches a demo account
    const demoUser = DEMO_ACCOUNTS.find(u => u.email === email);
    if (demoUser && password === 'password') {
      login(demoUser);
      navigate('/');
    } else {
      setError('Invalid credentials. Use demo accounts.');
    }
  };

  const handleDemoLogin = (user: User) => {
    login(user);
    navigate('/');
  };

  return (
    <div>
      {error && (
        <div className="mb-4 bg-red-50 border border-critical text-critical px-4 py-3 rounded-md flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email address
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-primary hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Sign in
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">Or use demo account</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              onClick={() => handleDemoLogin(account)}
              className="w-full inline-flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-500 hover:bg-slate-50"
            >
              <span className="truncate">{account.name} ({account.role.replace('_', ' ')})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:text-blue-500">
          Register here
        </Link>
      </div>
    </div>
  );
}
