import api from "../api/axios";
import { Project, ProjectCategory, ProjectStatus } from "../types";

export interface ProjectListParams {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  category?: ProjectCategory;
}

const projectService = {
  // List endpoint wraps results as { data: { projects: [...] } }.
  getAll: async (params: ProjectListParams = {}): Promise<Project[]> => {
    const response = await api.get("/projects/", { params });
    return response.data.data.projects as Project[];
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data.data as Project;
  },

  // Owner-or-admin on the backend — admins can update/delete any project,
  // not just their own (see the ownership check in routers/projects.py).
  updateStatus: async (id: string, status: ProjectStatus): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, { status });
    return response.data.data as Project;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export default projectService;
