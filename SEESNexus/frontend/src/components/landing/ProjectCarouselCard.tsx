import React from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Project, ProjectStatus } from "../../types";
import { getItemImage } from "../../utils/imageHelper";

const STATUS_STYLES: Record<ProjectStatus, string> = {
  [ProjectStatus.IDEATION]:
    "bg-sees-teal/20 text-sees-teal border-sees-teal/40",
  [ProjectStatus.IN_PROGRESS]:
    "bg-sees-mustard/20 text-sees-mustard border-sees-mustard/40",
  [ProjectStatus.COMPLETED]:
    "bg-sees-mint/20 text-sees-mint border-sees-mint/40",
};

interface ProjectCarouselCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export const ProjectCarouselCard: React.FC<ProjectCarouselCardProps> = ({
  project,
  onSelect,
}) => {
  const thumbnail =
    project.thumbnail_url ||
    getItemImage(
      `${project.title} ${project.category.replace("_", " ").toLowerCase()} engineering technology project`,
      project.id,
      320,
      180,
    );

  // Capped so every card renders the same height regardless of tag count —
  // overflow tags collapse into a "+N" chip instead of wrapping to more lines.
  const visibleTech = project.tech_stack.slice(0, 3);
  const hiddenTechCount = project.tech_stack.length - visibleTech.length;

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 0.25 }}
      onClick={() => onSelect(project)}
      className="flex-shrink-0 w-72 snap-start cursor-pointer"
    >
      <GlassCard className="!p-0 h-full overflow-hidden" hoverGlow>
        <div className="aspect-video w-full overflow-hidden bg-sees-teal/20">
          <img
            src={thumbnail}
            alt={project.title}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>

        <div className="p-5">
          <span className="inline-block px-2 py-0.5 mb-2 rounded text-[10px] font-bold uppercase tracking-widest border border-sees-mint/30 text-sees-mint/80">
            {project.category.replace("_", " ")}
          </span>
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
            {project.title}
          </h3>
          <p className="text-sm text-white/75 line-clamp-2 mb-3">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {visibleTech.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-sees-mint/10 border border-sees-mint/20 rounded text-[10px] text-sees-mint uppercase font-bold"
              >
                {tech}
              </span>
            ))}
            {hiddenTechCount > 0 && (
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/50 font-bold">
                +{hiddenTechCount}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${STATUS_STYLES[project.status]}`}
            >
              {project.status.replace("_", " ")}
            </span>

            <div className="flex gap-2">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sees-mint/70 hover:text-sees-mint transition-colors"
                >
                  <Github size={16} />
                </a>
              )}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-sees-mint/70 hover:text-sees-mint transition-colors"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};
