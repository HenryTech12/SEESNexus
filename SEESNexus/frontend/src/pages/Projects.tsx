import React, { Suspense, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectCard3D } from "../components/three/ProjectCard3D";
import { Project, ProjectCategory } from "../types";
import { MOCK_PROJECTS } from "../mocks/projects";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import {
  X,
  Github,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Rocket,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getItemImage } from "../utils/imageHelper";
import projectService from "../services/projectService";

const ProjectsGallery = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState<ProjectCategory | "ALL">("ALL");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Backend defaults to limit=10 when omitted — request its max so the
        // gallery (and its category filter) isn't silently missing projects.
        const data = await projectService.getAll({ limit: 100 });
        setProjects(data);
      } catch (error) {
        // Silent fallback to MOCK_PROJECTS below — toasting here would show an
        // error alongside fully-rendered mock cards, which is contradictory.
        console.error("Failed to fetch projects:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const displayProjects = projects.length > 0 ? projects : MOCK_PROJECTS;

  const filteredProjects =
    filter === "ALL"
      ? displayProjects
      : displayProjects.filter((p) => p.category === filter);

  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-sees-void">
        <Loader2 className="w-8 h-8 animate-spin text-sees-emerald" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-sees-void overflow-hidden">
      {/* 3D Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 75 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
          onCreated={({ gl }) => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            gl.setPixelRatio(dpr);
            // handle context loss/restored
            const canvas = gl.domElement;
            const onLost = (e: Event) => {
              e.preventDefault();
              console.warn("WebGL context lost");
            };
            const onRestore = () => {
              console.info("WebGL context restored — reloading");
              window.location.reload();
            };
            canvas.addEventListener("webglcontextlost", onLost, false);
            canvas.addEventListener("webglcontextrestored", onRestore, false);
            // store handlers on element to cleanup if needed
            // @ts-expect-error - stashing handler refs on the DOM node, not a typed property
            canvas.__r3_onLost = onLost;
            // @ts-expect-error - stashing handler refs on the DOM node, not a typed property
            canvas.__r3_onRestore = onRestore;
          }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#A7FFEB" />

          <Suspense fallback={null}>
            <Stars
              radius={100}
              depth={50}
              count={2000}
              factor={3}
              saturation={0}
              fade
              speed={0.8}
            />
            {filteredProjects.map((project, index) => (
              <ProjectCard3D
                key={project.id}
                project={project}
                position={[
                  (index - (filteredProjects.length - 1) / 2) *
                    (window.innerWidth < 768 ? 3 : 5),
                  0,
                  0,
                ]}
                onClick={setSelectedProject}
              />
            ))}
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
          />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none p-4 md:p-8 flex flex-col justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start pointer-events-auto">
          <div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 text-sees-mint/40 hover:text-sees-mint transition-colors text-[10px] font-bold uppercase tracking-widest mb-3 group"
            >
              <ArrowLeft
                size={12}
                className="group-hover:-translate-x-0.5 transition-transform"
              />
              Dashboard
            </Link>
            <h1 className="text-2xl md:text-4xl font-black text-glow-mint mb-2">
              Innovation Gallery
            </h1>
            <p className="text-sees-mint/60 text-sm hidden sm:block">
              Exploring the frontier of SEES UNILAG engineering.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["ALL", ...Object.values(ProjectCategory)].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as ProjectCategory | "ALL")}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[10px] md:text-xs font-bold border transition-all ${
                  filter === cat
                    ? "bg-sees-mint text-sees-void border-sees-mint"
                    : "bg-sees-void/50 text-sees-mint border-sees-mint/30 hover:border-sees-mint"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sees-mint/30 font-mono text-xs uppercase tracking-[0.3em]">
              No {filter === "ALL" ? "" : filter + " "}projects found
            </p>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-sees-void/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-4xl w-full pointer-events-auto"
            >
              <GlassCard className="!p-0 overflow-hidden border-sees-mint/30">
                <div className="flex flex-col md:flex-row h-full">
                  {/* Left Side - Image/Visual */}
                  <div className="md:w-1/2 bg-sees-teal/30 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-sees-mint/10">
                    <div className="w-full aspect-video bg-emerald-900/20 rounded-lg border border-sees-mint/20 overflow-hidden relative">
                      {/* Fallback always rendered behind — visible when image fails or is slow */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Rocket className="w-10 h-10 text-sees-mint/10" />
                      </div>
                      <img
                        src={getItemImage(
                          `${selectedProject.title} ${selectedProject.category.replace("_", " ").toLowerCase()} engineering technology project`,
                          selectedProject.id,
                          600,
                          338,
                        )}
                        alt={selectedProject.title}
                        loading="lazy"
                        className="w-full h-full object-cover relative"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Side - Content */}
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
                            window.open(selectedProject.github_url, "_blank", "noopener,noreferrer")
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
                            window.open(selectedProject.demo_url, "_blank", "noopener,noreferrer")
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
    </div>
  );
};

export default ProjectsGallery;
