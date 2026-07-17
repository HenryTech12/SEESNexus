import React from 'react';
import { motion } from 'framer-motion';
import { Github, ExternalLink, User, Layers, Edit2 } from 'lucide-react';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

const ProjectCard = ({ project, onEdit }) => {
  const { user, isContributor, isAdmin } = useAuth();
  const canEdit = isAdmin || (isContributor && project.created_by?.id === user?.id);

  const statusColors = {
    'IDEATION': 'border-sees-mustard',
    'IN_PROGRESS': 'border-blue-400',
    'COMPLETED': 'border-sees-mint'
  };

  const statusBadgeVariants = {
    'IDEATION': 'mustard',
    'IN_PROGRESS': 'blue',
    'COMPLETED': 'mint'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`glass-card overflow-hidden border-l-4 ${statusColors[project.status] || 'border-white/10'} group h-full flex flex-col`}
    >
      {/* Thumbnail */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-sees-forest/60 to-sees-teal/40">
        {project.thumbnail_url ? (
          <img
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Layers size={48} className="text-white/10 group-hover:text-sees-mint/20 transition-colors" />
            <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 opacity-20 ${statusColors[project.status]}`} />
          </div>
        )}

        {/* Floating Icons */}
        <div className="absolute top-4 right-4 flex space-x-2">
          {canEdit && (
            <button
              onClick={() => onEdit?.(project)}
              className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:text-sees-mint transition-colors"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="absolute bottom-4 left-4">
          <Badge variant="mint" className="bg-black/40 backdrop-blur-md border-white/10">
            {project.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-white group-hover:text-sees-mint transition-colors line-clamp-1">
            {project.title}
          </h3>
          <Badge variant={statusBadgeVariants[project.status]}>
            {project.status.replace('_', ' ')}
          </Badge>
        </div>

        <p className="text-sm text-white/60 mb-6 line-clamp-2">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tech_stack?.slice(0, 3).map((tech) => (
            <span key={tech} className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-white/40 border border-white/5 uppercase tracking-wider">
              {tech}
            </span>
          ))}
          {project.tech_stack?.length > 3 && (
            <span className="text-[10px] font-bold text-white/20 mt-1">
              +{project.tech_stack.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-sees-mint/10 border border-sees-mint/20 flex items-center justify-center mr-2">
              <User size={14} className="text-sees-mint" />
            </div>
            <span className="text-xs font-bold text-white/60">
              {project.created_by?.full_name?.split(' ')[0] || 'Unknown'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <Github size={18} />
              </a>
            )}
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="text-white/40 hover:text-white transition-colors"
              >
                <ExternalLink size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
