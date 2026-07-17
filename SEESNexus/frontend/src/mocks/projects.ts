import { Project, ProjectCategory, ProjectStatus } from "../types";

// Fallback data shown when the /projects API is unreachable
export const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    title: "Verifact AI",
    description:
      "AI-powered fact-checking for Nigerian media using NLP and historical data patterns.",
    category: ProjectCategory.AI_ML,
    status: ProjectStatus.COMPLETED,
    tech_stack: ["Python", "React", "FastAPI"],
    created_by_id: "user1",
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    title: "FloodGuard",
    description:
      "IoT flood monitoring for Lagos waterways with real-time solar-powered sensor nodes.",
    category: ProjectCategory.IOT,
    status: ProjectStatus.IN_PROGRESS,
    tech_stack: ["Arduino", "C++", "MQTT"],
    created_by_id: "user2",
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    title: "BAER System",
    description:
      "Bio-adaptive emergency vehicle rerouting using traffic camera vision and edge AI.",
    category: ProjectCategory.EMBEDDED,
    status: ProjectStatus.IDEATION,
    tech_stack: ["TensorFlow", "Raspberry Pi", "C++"],
    created_by_id: "user3",
    created_at: "",
    updated_at: "",
  },
];
