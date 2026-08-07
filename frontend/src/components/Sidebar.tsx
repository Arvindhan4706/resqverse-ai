import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  AlertTriangle, 
  Box, 
  CheckSquare, 
  MonitorPlay, 
  BarChart3, 
  History 
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Live Map', path: '/map', icon: MapIcon },
  { name: 'Incidents', path: '/incidents', icon: AlertTriangle },
  { name: 'Resources', path: '/resources', icon: Box },
  { name: 'Approvals', path: '/approvals', icon: CheckSquare },
  { name: 'Simulations', path: '/simulations', icon: MonitorPlay },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Audit Log', path: '/audit', icon: History },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-navy-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-4 mb-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <MonitorPlay className="text-primary w-6 h-6" />
          ResQVerse AI
        </h1>
        <div className="mt-2 text-xs font-semibold bg-amber-500/20 text-warning px-2 py-1 rounded inline-block">
          SIMULATION MODE
        </div>
      </div>
      
      <nav className="flex-1 px-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              isActive 
                ? "bg-slate-800 text-white" 
                : "hover:bg-slate-800/50 hover:text-white"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 text-xs text-slate-500 mt-auto">
        &copy; {new Date().getFullYear()} ResQVerse AI
      </div>
    </aside>
  );
}
