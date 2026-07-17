import { Article } from "../types";

// Fallback data shown when the /articles API is unreachable
export const MOCK_ARTICLES: Article[] = [
  {
    id: "1",
    slug: "smart-grid-nigeria",
    title: "Building a Smart Grid for Nigeria's Energy Future",
    content:
      "Nigeria's power infrastructure faces chronic instability. This article explores how IoT sensor networks and edge computing can modernise the national grid, reduce outages, and enable real-time load balancing across distribution zones.",
    excerpt:
      "How IoT and edge computing can modernise Nigeria's power infrastructure and reduce chronic outages.",
    tags: ["energy", "IoT", "Nigeria"],
    status: "PUBLISHED",
    author_id: "user1",
    author: { id: "user1", full_name: "Adeyemi Okonkwo" },
    published_at: "2024-03-15T09:00:00Z",
    created_at: "2024-03-10T09:00:00Z",
    updated_at: "2024-03-15T09:00:00Z",
  },
  {
    id: "2",
    slug: "embedded-ml-inference",
    title: "Running ML Inference on Microcontrollers with TinyML",
    content:
      "TinyML lets you run trained models directly on devices with kilobytes of RAM. We walk through deploying a gesture-recognition model onto an Arduino Nano 33 BLE Sense, from dataset collection through quantisation to on-device inference.",
    excerpt:
      "A practical walkthrough of deploying gesture recognition onto an Arduino using TinyML.",
    tags: ["ML", "embedded", "Arduino"],
    status: "PUBLISHED",
    author_id: "user2",
    author: { id: "user2", full_name: "Chisom Eze" },
    published_at: "2024-04-02T11:00:00Z",
    created_at: "2024-03-28T11:00:00Z",
    updated_at: "2024-04-02T11:00:00Z",
  },
  {
    id: "3",
    slug: "pcb-design-kicad",
    title: "PCB Design for Beginners: From Schematic to Fabrication",
    content:
      "Designing your first PCB is easier than it looks. This guide covers schematic capture in KiCad, component footprint assignment, layout best practices for signal integrity, and submitting Gerber files to a fab house.",
    excerpt:
      "A beginner's guide to going from KiCad schematic to a fabricated PCB.",
    tags: ["hardware", "PCB", "KiCad"],
    status: "PUBLISHED",
    author_id: "user3",
    author: { id: "user3", full_name: "Femi Adebayo" },
    published_at: "2024-05-10T08:30:00Z",
    created_at: "2024-05-06T08:30:00Z",
    updated_at: "2024-05-10T08:30:00Z",
  },
];
