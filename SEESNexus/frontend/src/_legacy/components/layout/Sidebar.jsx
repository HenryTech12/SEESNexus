import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  Cpu,
  Calendar,
  FileText,
  PenTool,
  Users,
  Briefcase,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, logout, isAdmin, isContributor } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderOpen },
    { label: 'Hardware Lab', path: '/hardware', icon: Cpu },
    { label: 'Events', path: '/events', icon: Calendar },
    { label: 'Articles', path: '/articles', icon: FileText },
  ];

  const contributorItems = [
    { label: 'Write Article', path: '/articles/compose', icon: PenTool },
  ];

  const adminItems = [
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Loans', path: '/admin/loans', icon: Briefcase },
    { label: 'Manage Hardware', path: '/admin/hardware', icon: Settings },
  ];

  const NavItem = ({ item, isChild = false }) => (
    <NavLink
      to={item.path}
      onClick={() => setIsMobileOpen(false)}
      className={({ isActive }) => `
        flex items-center px-4 py-3 mb-1 rounded-xl transition-all duration-200 group
        ${isActive
          ? 'bg-sees-mint/15 text-sees-mint border-l-2 border-sees-mint shadow-sees-glow'
          : 'text-white/60 hover:text-white hover:bg-white/5'}
      `}
    >
      <item.icon size={20} className={`${collapsed ? 'mx-auto' : 'mr-3'}`} />
      {!collapsed && <span className="font-medium">{item.label}</span>}
      {!collapsed && <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />}
    </NavLink>
  );

  const sidebarVariants = {
    expanded: { width: 256 },
    collapsed: { width: 80 }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 right-4 z-[60] p-2 glass-card text-sees-mint"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        variants={sidebarVariants}
        animate={collapsed ? 'collapsed' : 'expanded'}
        className={`
          fixed top-0 left-0 h-full bg-sees-forest/95 backdrop-blur-sees border-r border-sees-teal/20 z-[55]
          flex flex-col overflow-hidden transition-all duration-300
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-sees-mint rounded-xl flex items-center justify-center shrink-0 shadow-sees-glow">
              <span className="text-sees-forest font-black text-xl">N</span>
            </div>
            {!collapsed && (
              <div className="ml-3 animate-fadeIn">
                <h1 className="text-lg font-black text-white leading-none">SEES NEXUS</h1>
                <p className="text-[10px] text-sees-mint font-bold tracking-widest uppercase">Innovation Hub</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:block text-white/40 hover:text-sees-mint transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* User Profile Section */}
        {!collapsed && user && (
          <div className="px-6 py-4 mx-4 mb-6 glass-card border-sees-mint/10 bg-white/5">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-sees flex items-center justify-center border border-sees-mint/30 text-sees-mint font-bold">
                {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.full_name}</p>
                <div className="flex items-center">
                  <span className="text-[10px] bg-sees-mint/20 text-sees-mint px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {navItems.map(item => <NavItem key={item.path} item={item} />)}
          </div>

          {(isContributor || isAdmin) && (
            <div className="mt-8">
              {!collapsed && <p className="px-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-3">Writer</p>}
              <div className="space-y-1">
                {contributorItems.map(item => <NavItem key={item.path} item={item} />)}
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="mt-8">
              {!collapsed && (
                <div className="px-4 flex items-center mb-3">
                  <ShieldCheck size={12} className="text-sees-mustard mr-2" />
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Management</p>
                </div>
              )}
              <div className="space-y-1">
                {adminItems.map(item => <NavItem key={item.path} item={item} />)}
              </div>
            </div>
          )}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-sees-teal/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} className={`${collapsed ? 'mx-auto' : 'mr-3'}`} />
            {!collapsed && <span className="font-bold">Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export { Sidebar };
export default Sidebar;
