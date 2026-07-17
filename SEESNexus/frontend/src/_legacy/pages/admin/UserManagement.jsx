import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, ShieldAlert, ShieldCheck, Mail, Hash, MoreVertical, Trash2 } from 'lucide-react';
import authService from '../../services/authService';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await authService.getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, newRole);
      toast.success(`User promoted to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update clearance level');
    }
  };

  if (loading) return <div className="h-64 flex items-center justify-center"><Spinner /></div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Full Name & Credentials</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Matrix ID</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Clearance Level</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Account Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sees-forest to-sees-teal flex items-center justify-center font-black text-white border border-white/10 uppercase">
                      {user.full_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-bold">{user.full_name}</p>
                      <div className="flex items-center gap-2 text-white/30 text-xs mt-0.5">
                        <Mail size={12} /> {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 font-mono text-xs text-white/60">
                    <Hash size={12} className="text-sees-mint" /> {user.matric_number || 'STAFF-ID'}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className={`bg-white/5 border border-white/10 rounded-lg py-1 px-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-sees-mint transition-colors ${
                      user.role === 'ADMIN' ? 'text-red-400' : user.role === 'CONTRIBUTOR' ? 'text-sees-mint' : 'text-white'
                    }`}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="CONTRIBUTOR">CONTRIBUTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td className="px-8 py-6">
                  <Badge variant={user.is_active ? 'mint' : 'gray'}>
                    {user.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                  </Badge>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-white/40 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                    <button className="p-2 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default UserManagement;
