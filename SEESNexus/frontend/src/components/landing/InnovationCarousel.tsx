import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2, X, Github, ExternalLink, Rocket } from "lucide-react";
import toast from "react-hot-toast";
import { ProjectCarouselCard } from "./ProjectCarouselCard";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";
import { Project } from "../../types";
import { MOCK_PROJECTS } from "../../mocks/projects";
import projectService from "../../services/projectService";
import { formatError } from "../../utils/errorHelper";
import { getItemImage } from "../../utils/imageHelper";

export const InnovationCarousel: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Backend defaults to limit=10 when omitted — request its max so the
        // carousel isn't silently missing projects.
        const data = await projectService.getAll({ limit: 100 });
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
        toast.error(formatError(error, "Failed to load projects"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Falls back to MOCK_PROJECTS whenever the API is empty or unreachable — same pattern as Projects.tsx
  const displayProjects = projects.length > 0 ? projects : MOCK_PROJECTS;

  return (
    <section className="relative py-20 bg-sees-void">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-end justify-between mb-8">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-sees-mustard mb-2 block">
            Innovation Carousel
          </span>
          <h2 className="text-2xl md:text-4xl font-black text-white">
            What SEES Engineers Are Building
          </h2>
        </div>
        <Link
          to="/projects"
          className="hidden sm:inline text-sm font-semibold text-sees-mint/70 hover:text-sees-mint transition-colors"
        >
          View All →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-sees-mint" />
        </div>
      ) : (
        <div className="flex items-start gap-6 px-6 md:px-8 pb-4 overflow-x-auto snap-x snap-mandatory scroll-pl-6 md:scroll-pl-8">
          {displayProjects.map((project) => (
            <ProjectCarouselCard
              key={project.id}
              project={project}
              onSelect={setSelectedProject}
            />
          ))}
        </div>
      )}

      {/* Detail modal — same selectedProject + AnimatePresence pattern as Projects.tsx;
                serves both the mobile tap-to-view flow and desktop click-for-full-detail */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sees-void/80 backdrop-blur-md"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-4xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="!p-0 overflow-hidden border-sees-mint/30">
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-1/2 bg-sees-teal/30 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-sees-mint/10">
                    <div className="w-full aspect-video bg-sees-teal/20 rounded-lg border border-sees-mint/20 overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Rocket className="w-10 h-10 text-sees-mint/10" />
                      </div>
                      <img
                        src={
                          selectedProject.thumbnail_url ||
                          getItemImage(
                            `${selectedProject.title} ${selectedProject.category.replace("_", " ").toLowerCase()} engineering technology project`,
                            selectedProject.id,
                            600,
                            338,
                          )
                        }
                        alt={selectedProject.title}
                        loading="lazy"
                        className="w-full h-full object-cover relative"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  <div className="md:w-1/2 p-8 relative">
                    <button
                      onClick={() => setSelectedProject(null)}
                      className="absolute top-4 right-4 p-2 text-sees-mint/50 hover:text-sees-mint hover:bg-sees-mint/10 rounded-full transition-all"
                    >
                      <X size={20} />
                    </button>

                    <div className="mb-6 text-left">
                      <span className="text-xs font-bold text-sees-mustard uppercase tracking-widest mb-2 block">
                        {selectedProject.status.replace("_", " ")}
                      </span>
                      <h2 className="text-3xl font-black text-white mb-2">
                        {selectedProject.title}
                      </h2>
                      <p className="text-sees-mint/70 text-sm leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-sees-mint uppercase tracking-widest mb-3">
                          Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tech_stack.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-sees-mint/10 border border-sees-mint/20 rounded text-[10px] text-sees-mint uppercase font-bold"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          variant="secondary"
                          className="flex-1 gap-2 py-2"
                          disabled={!selectedProject.github_url}
                          onClick={() =>
                            selectedProject.github_url &&
                            window.open(
                              selectedProject.github_url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <Github size={18} /> GitHub
                        </Button>
                        <Button
                          variant="primary"
                          className="flex-1 gap-2 py-2"
                          disabled={!selectedProject.demo_url}
                          onClick={() =>
                            selectedProject.demo_url &&
                            window.open(
                              selectedProject.demo_url,
                              "_blank",
                              "noopener,noreferrer",
                            )
                          }
                        >
                          <ExternalLink size={18} /> Live Demo
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
