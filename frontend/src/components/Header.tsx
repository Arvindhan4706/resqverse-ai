import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatRole = (role: string) => {
    return role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        {/* Breadcrumbs or Page Title could go here */}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {user?.name?.charAt(0) || <UserIcon size={16} />}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-900 leading-none">{user?.name}</span>
            <span className="text-xs text-slate-500 leading-tight mt-1">{user?.role ? formatRole(user.role) : 'Guest'}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 text-slate-500 hover:text-critical hover:bg-red-50 rounded-full transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
