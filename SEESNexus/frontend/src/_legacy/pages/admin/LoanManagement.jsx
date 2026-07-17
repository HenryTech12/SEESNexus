import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CheckCircle, XCircle, Clock, Calendar, Hash, ArrowUpRight } from 'lucide-react';
import hardwareService from '../../services/hardwareService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const LoanManagement = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const data = await hardwareService.getAllLoans();
      setLoans(data);
    } catch (error) {
      toast.error('Failed to load logistics database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleAction = async (loanId, action) => {
    try {
      if (action === 'APPROVE') await hardwareService.approveLoan(loanId);
      if (action === 'REJECT') await hardwareService.rejectLoan(loanId);
      if (action === 'RETURN') await hardwareService.completeReturn(loanId);

      toast.success(`Logistics: ${action} command executed`);
      fetchLoans();
    } catch (error) {
      toast.error('Logistics command failed');
    }
  };

  const filteredLoans = loans.filter(l => l.status === filter);

  if (loading) return <div className="h-64 flex items-center justify-center"><Spinner /></div>;

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex items-center gap-4">
        {['PENDING', 'APPROVED', 'RETURNED', 'REJECTED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              filter === f
                ? 'bg-sees-mint border-sees-mint text-sees-void shadow-sees-glow'
                : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Hardware Request</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Requesting Cadet</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Timeline</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] text-right">Auth Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence mode="popLayout">
                {filteredLoans.length > 0 ? filteredLoans.map((loan) => (
                  <motion.tr
                    key={loan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-sees-forest/20 rounded-lg flex items-center justify-center text-sees-mint">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <p className="text-white font-bold">{loan.hardware?.name}</p>
                          <p className="text-[10px] font-mono text-white/30 uppercase">QTY: {loan.quantity} UNITS</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">{loan.user?.full_name}</span>
                        <span className="text-[10px] font-mono text-white/30">{loan.user?.matric_number}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
                          <Calendar size={12} className="text-sees-mint" />
                          {format(new Date(loan.loan_date), 'MMM dd')} → {format(new Date(loan.expected_return_date), 'MMM dd')}
                        </div>
                        {loan.actual_return_date && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-sees-mint">
                            <Clock size={12} /> Returned: {format(new Date(loan.actual_return_date), 'MMM dd')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <Badge variant={loan.status === 'PENDING' ? 'mustard' : loan.status === 'APPROVED' ? 'mint' : 'gray'}>
                        {loan.status}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {loan.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(loan.id, 'APPROVE')}
                            className="bg-sees-mint/10 hover:bg-sees-mint text-sees-mint hover:text-sees-void p-2 rounded-lg border border-sees-mint/20 transition-all"
                            title="Approve Loan"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleAction(loan.id, 'REJECT')}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-2 rounded-lg border border-red-500/20 transition-all"
                            title="Reject Request"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                      {loan.status === 'APPROVED' && (
                        <button
                          onClick={() => handleAction(loan.id, 'RETURN')}
                          className="bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-4 py-2 rounded-lg border border-blue-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Confirm Return
                        </button>
                      )}
                      {loan.status !== 'PENDING' && loan.status !== 'APPROVED' && (
                        <div className="flex items-center justify-end gap-2 font-mono text-white/20 text-[10px]">
                          <Hash size={12} /> {loan.id.split('-')[0].toUpperCase()}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="px-8 py-20 text-center">
                      <EmptyState
                        icon={ShoppingBag}
                        title={`No ${filter.toLowerCase()} requests`}
                        description="The logistics queue is currently clear for this sector."
                        className="py-0"
                      />
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default LoanManagement;
