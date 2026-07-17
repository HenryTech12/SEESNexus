import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Cpu,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import projectService from '../../services/projectService';
import hardwareService from '../../services/hardwareService';
import eventService from '../../services/eventService';
import articleService from '../../services/articleService';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/ui/StatCard';
import ProjectCard from '../../components/projects/ProjectCard';
import EventCard from '../../components/events/EventCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    hardware: 0,
    events: 0,
    articles: 0
  });
  const [loans, setLoans] = useState([]);
  const [events, setEvents] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [projRes, hwRes, evRes, artRes, loanRes] = await Promise.all([
          projectService.getAll({ limit: 4 }),
          hardwareService.getAll({ limit: 1 }),
          eventService.getAll({ upcoming_only: true, limit: 3 }),
          articleService.getAll({ limit: 1 }),
          hardwareService.getMyLoans()
        ]);

        setProjects(projRes.items || []);
        setEvents(evRes.items || []);
        setLoans(loanRes || []);
        setStats({
          projects: projRes.pagination?.total || 0,
          hardware: hwRes.pagination?.total || 0,
          events: evRes.pagination?.total || 0,
          articles: artRes.pagination?.total || 0
        });
      } catch (error) {
        console.error('Loader error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleReturnHardware = async (loanId) => {
    try {
      await hardwareService.returnLoan(loanId);
      toast.success('Hardware return request submitted');
      const updatedLoans = await hardwareService.getMyLoans();
      setLoans(updatedLoans);
    } catch (error) {
      toast.error('Failed to return hardware');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <PageWrapper>
      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">
          Hello, <span className="text-sees-mint">{user?.full_name?.split(' ')[0]}</span>
        </h1>
        <p className="text-white/60 font-medium">Here's what's happening at SEES Nexus today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Total Projects" value={stats.projects} icon={FolderOpen} color="blue" />
        <StatCard title="Hardware Items" value={stats.hardware} icon={Cpu} color="mint" />
        <StatCard title="Upcoming Events" value={stats.events} icon={Calendar} color="mustard" />
        <StatCard title="Latest Articles" value={stats.articles} icon={FileText} color="purple" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Active Loans & Events */}
        <div className="lg:col-span-1 space-y-8">
          {/* Active Loans */}
          <section className="glass-card overflow-hidden">
            <div className="p-6 border-b border-sees-teal/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Clock size={20} className="text-sees-mustard mr-2" />
                My Active Loans
              </h2>
              <Link to="/hardware" className="text-xs font-bold text-sees-mint hover:underline flex items-center">
                View Lab <ChevronRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-sees-teal/10">
              {loans.length > 0 ? (
                loans.map((loan) => (
                  <div key={loan.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-white text-sm">{loan.hardware?.name}</p>
                      <Badge variant={loan.status === 'APPROVED' ? 'mint' : 'mustard'}>
                        {loan.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider">
                        Return by: {loan.expected_return_date ? format(new Date(loan.expected_return_date), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                      {loan.status === 'APPROVED' && (
                        <button
                          onClick={() => handleReturnHardware(loan.id)}
                          className="text-[10px] font-bold text-sees-mint border border-sees-mint/30 px-2 py-1 rounded hover:bg-sees-mint/20 transition-all"
                        >
                          Return
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white/5">
                  <p className="text-sm text-white/40 italic">No active hardware loans</p>
                </div>
              )}
            </div>
          </section>

          {/* Upcoming Events */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upcoming Events</h2>
              <Link to="/events" className="text-sm font-bold text-sees-mint hover:underline">All Events</Link>
            </div>
            <div className="space-y-6">
              {events.length > 0 ? (
                events.map(event => <EventCard key={event.id} event={event} />)
              ) : (
                <p className="text-white/40 italic text-sm py-4">No upcoming events scheduled</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column - Project Feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Latest Community Projects</h2>
            <Link to="/projects" className="text-sm font-bold text-sees-mint hover:underline">View All</Link>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {projects.length > 0 ? (
              projects.map(project => <ProjectCard key={project.id} project={project} />)
            ) : (
              <div className="col-span-2">
                <EmptyState
                  icon={FolderOpen}
                  title="No projects yet"
                  description="Be the first to showcase your engineering feat to the community."
                  action={{
                    label: 'Create Project',
                    onClick: () => {}, // Would open modal
                    icon: PlusCircle
                  }}
                />
              </div>
            )}
          </div>

          {/* Featured Article Teaser */}
          <div className="mt-12 glass-card p-1 bg-gradient-to-r from-sees-mint/20 to-transparent">
            <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-between bg-sees-void/90">
              <div className="text-center md:text-left mb-6 md:mb-0">
                <p className="text-sees-mint font-bold uppercase tracking-widest text-xs mb-2">Featured Insight</p>
                <h3 className="text-2xl font-black text-white mb-2">The Future of Embedded Systems in Nigeria</h3>
                <p className="text-white/40 text-sm max-w-md">By Dr. O. A. Adebola — 5 min read</p>
              </div>
              <Button onClick={() => {}}>Read Article</Button>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Dashboard;
