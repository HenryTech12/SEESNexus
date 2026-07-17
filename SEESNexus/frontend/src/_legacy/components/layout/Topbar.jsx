import React from 'react';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Topbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path.startsWith('/hardware')) return 'Hardware Lab';
    if (path === '/events') return 'Events';
    if (path.startsWith('/articles')) return 'Articles';
    if (path === '/admin/users') return 'User Management';
    if (path === '/admin/loans') return 'Loan Management';
    if (path === '/admin/hardware') return 'Hardware Management';
    return 'SEES Nexus';
  };

  return (
    <header className="h-16 bg-sees-void/80 backdrop-blur-sees border-b border-sees-teal/20 sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-xl font-black text-white">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search Placeholder */}
        <div className="hidden md:flex items-center bg-sees-forest/40 border border-sees-teal/20 rounded-lg px-3 py-1.5 focus-within:border-sees-mint transition-colors">
          <Search size={16} className="text-white/40" />
          <input
            type="text"
            placeholder="Search Nexus..."
            className="bg-transparent border-none outline-none text-sm ml-2 w-48 text-white placeholder-white/20"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 text-white/60 hover:text-sees-mint hover:bg-white/5 rounded-lg transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-sees-mustard rounded-full border-2 border-sees-void"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center pl-4 border-l border-sees-teal/10 space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-none">{user?.full_name}</p>
            <p className="text-[10px] text-sees-mint font-medium uppercase mt-1 leading-none">{user?.role}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gradient-sees flex items-center justify-center border border-sees-mint/20 text-sees-mint text-sm font-black">
            {user?.full_name?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
