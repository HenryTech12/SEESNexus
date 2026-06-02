import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Edit, Trash2, Video } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

const EventCard = ({ event, onRegister, onEdit, onDelete, onViewParticipants }) => {
  const { isAdmin } = useAuth();
  const isExpired = isPast(new Date(event.registration_deadline));
  const isRegistered = event.is_registered;

  const typeVariants = {
    'HACKATHON': 'mustard',
    'WORKSHOP': 'mint',
    'SEMINAR': 'blue',
    'CONFERENCE': 'purple'
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card overflow-hidden group h-full flex flex-col"
    >
      {/* Banner */}
      <div className="h-48 relative bg-gradient-to-br from-sees-forest to-sees-teal overflow-hidden">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20">
            <Calendar size={80} className="text-sees-mint" />
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col space-y-2">
          <Badge variant={typeVariants[event.event_type] || 'gray'} className="bg-black/40 backdrop-blur-md border-white/10 uppercase tracking-widest px-3 py-1">
            {event.event_type}
          </Badge>
          {event.is_virtual && (
            <Badge variant="mint" className="bg-black/40 backdrop-blur-md border-white/10 flex items-center">
              <Video size={12} className="mr-1" /> VIRTUAL
            </Badge>
          )}
        </div>

        {isAdmin && (
          <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onViewParticipants?.(event)} className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:text-blue-400 transition-colors">
              <Users size={16} />
            </button>
            <button onClick={() => onEdit?.(event)} className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:text-sees-mint transition-colors">
              <Edit size={16} />
            </button>
            <button onClick={() => onDelete?.(event)} className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:text-red-400 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        )}

        {/* Deadline Overlay */}
        {!isExpired && !isRegistered && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">
              Registration closes {formatDistanceToNow(new Date(event.registration_deadline), { addSuffix: true })}
            </p>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-2xl font-black text-white mb-4 group-hover:text-sees-mint transition-colors line-clamp-1">
          {event.title}
        </h3>

        <div className="space-y-3 mb-6">
          <div className="flex items-center text-white/50 text-sm font-medium">
            <Calendar size={16} className="text-sees-mint mr-3 shrink-0" />
            <span>{format(new Date(event.start_date), 'MMM dd')} – {format(new Date(event.end_date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center text-white/50 text-sm font-medium">
            <MapPin size={16} className="text-sees-mint mr-3 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center text-white/50 text-sm font-medium">
            <Users size={16} className="text-sees-mint mr-3 shrink-0" />
            <span>{event.participant_count || 0} / {event.max_participants || '∞'} participants</span>
          </div>
        </div>

        <p className="text-sm text-white/60 mb-8 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        <div className="mt-auto">
          <Button
            className="w-full shadow-sees-glow"
            disabled={isExpired || isRegistered}
            onClick={() => onRegister?.(event.id)}
            variant={isRegistered ? 'secondary' : 'primary'}
            icon={isRegistered ? null : ArrowRight}
          >
            {isRegistered ? 'Registered ✓' : isExpired ? 'Registration Closed' : 'Register Now'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
