import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Edit, Trash2, Info } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const HardwareCard = ({ hardware, onLoan, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();

  const getStatusColor = () => {
    if (hardware.status === 'AVAILABLE') return 'bg-sees-mint';
    if (hardware.status === 'BORROWED') return 'bg-white/40';
    if (hardware.status === 'MAINTENANCE') return 'bg-sees-mustard';
    return 'bg-gray-500';
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card overflow-hidden group h-full flex flex-col"
    >
      {/* Image / Icon Area */}
      <div className="h-40 bg-gradient-to-br from-sees-forest/80 to-sees-teal/60 relative flex items-center justify-center overflow-hidden">
        {hardware.image_url ? (
          <img
            src={hardware.image_url}
            alt={hardware.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <Cpu size={64} className="text-white/10 group-hover:text-sees-mint/20 transition-all duration-300" />
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit?.(hardware)}
              className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:text-sees-mint transition-colors"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete?.(hardware)}
              className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:text-red-400 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

        <div className="absolute top-4 left-4">
          <Badge variant="mint" className="bg-black/40 backdrop-blur-md border-white/10">
            {hardware.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-sees-mint transition-colors">
            {hardware.name}
          </h3>
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor()}${hardware.status === 'AVAILABLE' ? ' animate-pulse' : ''}`} />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">
              {hardware.status}
            </span>
          </div>
        </div>

        <p className="font-mono text-[10px] text-white/30 truncate mb-4">
          SN: {hardware.serial_number}
        </p>

        <p className="text-sm text-white/60 mb-6 line-clamp-2">
          {hardware.description}
        </p>

        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Available</span>
              <span className="text-lg font-black text-white">
                {hardware.available_quantity} <span className="text-sm text-white/40 font-medium">/ {hardware.quantity}</span>
              </span>
            </div>
            {hardware.available_quantity < hardware.quantity && (
              <Badge variant="gray" className="animate-fadeIn">
                {hardware.quantity - hardware.available_quantity} out
              </Badge>
            )}
          </div>

          <Button
            className="w-full"
            disabled={hardware.available_quantity === 0 || hardware.status !== 'AVAILABLE'}
            onClick={() => onLoan?.(hardware)}
            icon={Info}
          >
            {hardware.status === 'AVAILABLE'
              ? hardware.available_quantity > 0 ? 'Request Loan' : 'Out of Stock'
              : hardware.status.replace('_', ' ')}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default HardwareCard;
