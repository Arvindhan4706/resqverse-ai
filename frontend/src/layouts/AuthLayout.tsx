import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MonitorPlay, ShieldAlert, Activity, Users } from 'lucide-react';

export function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0f18] text-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0f18] flex text-slate-200">
      {/* Left Panel - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex lg:flex-col lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0c1322] to-[#040810] border-r border-slate-800/50">
        
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        
        {/* Radar/Map Glowing effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-30 pointer-events-none animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col h-full justify-between p-12">
          <div>
            <div className="flex items-center gap-3 text-primary mb-8 animate-fade-in-down">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 backdrop-blur-sm shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <MonitorPlay size={32} className="text-primary" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                ResQVerse<span className="text-primary">.AI</span>
              </h1>
            </div>
            
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Next-Generation<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Disaster Response</span><br/>
              Simulation.
            </h2>
            
            <p className="text-slate-400 text-lg max-w-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Command, coordinate, and simulate large-scale emergency operations with intelligent AI-driven logistics and routing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <Activity className="text-emerald-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm text-slate-500 font-medium">System Uptime</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <ShieldAlert className="text-amber-400 mb-2" size={24} />
              <div className="text-2xl font-bold text-white">&lt; 10ms</div>
              <div className="text-sm text-slate-500 font-medium">Alert Latency</div>
            </div>
          </div>

          <div className="mt-12 text-sm text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} ResQVerse AI Systems. Secure Access Node.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative">
        {/* Mobile Branding (Only visible on small screens) */}
        <div className="lg:hidden flex flex-col items-center mb-10 text-center">
           <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <MonitorPlay size={40} className="text-primary" />
          </div>
          <h2 className="text-3xl font-black text-white">ResQVerse<span className="text-primary">.AI</span></h2>
          <p className="mt-2 text-sm text-slate-400 font-medium">Command Center Authentication</p>
        </div>

        <div className="w-full max-w-md animate-fade-in">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
