import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ShoppingBag,
  FolderOpen,
  Calendar,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import Spinner from '../../components/ui/Spinner';
import UserManagement from './UserManagement';
import LoanManagement from './LoanManagement';
import projectService from '../../services/projectService';
import hardwareService from '../../services/hardwareService';
import authService from '../../services/authService';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLoans: 0,
    pendingLoans: 0,
    totalProjects: 0
  });

  const tabs = [
    { id: 'overview', label: 'Command Center', icon: Activity },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'loans', label: 'Inventory Logistics', icon: ShoppingBag },
  ];

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        // Realistic simulated fetch for broad stats
        const users = await authService.getAllUsers();
        const loans = await hardwareService.getAllLoans();
        const projects = await projectService.getAll();

        setStats({
          totalUsers: users.length,
          activeLoans: loans.filter(l => l.status === 'APPROVED').length,
          pendingLoans: loans.filter(l => l.status === 'PENDING').length,
          totalProjects: projects.pagination.total
        });
      } catch (error) {
        console.error('Admin Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <SectionHeader
            title="Nexus Control"
            subtitle="Platform administration and system-wide orchestration."
            className="mb-0"
          />
          <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 font-black text-[10px] uppercase tracking-widest">
            <ShieldCheck size={14} /> Elevated Access Session
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${
                activeTab === tab.id
                  ? 'bg-sees-mint border-sees-mint text-sees-void shadow-sees-glow'
                  : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            {/* Real-time Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Cadets" value={stats.totalUsers} icon={Users} color="blue" trend="+12% vs last month" />
              <StatCard title="Active Logistics" value={stats.activeLoans} icon={ShoppingBag} color="mint" />
              <StatCard title="Pending Review" value={stats.pendingLoans} icon={AlertCircle} color="mustard" />
              <StatCard title="Nexus Projects" value={stats.totalProjects} icon={FolderOpen} color="purple" trend="+5 today" />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* System Alerts */}
              <div className="glass-card p-8 border-l-4 border-mustard">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <TrendingUp className="text-sees-mustard" /> Critical Intelligence
                </h3>
                <div className="space-y-4">
                  {[
                    { msg: "Server latency spikes detected in Lagos region", time: "2m ago", type: "warn" },
                    { msg: "Database re-indexing completed successfully", time: "1h ago", type: "info" },
                    { msg: "5 New project submissions awaiting review", time: "3h ago", type: "action" }
                  ].map((alert, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <p className="text-sm text-white/80">{alert.msg}</p>
                      <span className="text-[10px] font-mono text-white/20 uppercase">{alert.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card p-10 bg-sees-forest/10 flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-widest">Rapid Deployment</h3>
                <p className="text-white/40 mb-8 max-w-xs">Instantly broadcast an announcement or create a platform-wide maintenance window.</p>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button className="p-4 bg-white/5 rounded-xl border border-white/10 text-white font-bold text-xs uppercase hover:bg-sees-mint hover:text-sees-void transition-all flex items-center justify-center gap-2 group">
                    Live Broadcast <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                  <button className="p-4 bg-white/5 rounded-xl border border-white/10 text-white font-bold text-xs uppercase hover:bg-sees-mustard hover:text-sees-void transition-all flex items-center justify-center gap-2">
                    Security Lock
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'loans' && <LoanManagement />}
      </div>
    </PageWrapper>
  );
};

export default AdminPanel;
