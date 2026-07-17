import api from "../api/axios";
import { Article, ArticleStatus } from "../types";

export interface ArticleListParams {
    page?: number;
    limit?: number;
    tag?: string;
    status?: ArticleStatus;
}

export interface ArticlePayload {
    title: string;
    content: string;
    excerpt?: string;
    cover_image_url?: string;
    tags?: string[];
    status?: ArticleStatus;
}

export interface ArticlePage {
    articles: Article[];
    total: number;
    pages: number;
}

const articleService = {
    // List endpoint wraps results as { data: { articles, total, pages, ... } }.
    // There's no backend tag/category-listing endpoint — tag filter chips must be
    // derived client-side from the `tags` arrays of the loaded page of articles.
    getAll: async (params: ArticleListParams = {}): Promise<ArticlePage> => {
        const response = await api.get("/articles/", { params });
        const { articles, total, pages } = response.data.data;
        return { articles: articles as Article[], total, pages };
    },

    getBySlug: async (slug: string): Promise<Article> => {
        const response = await api.get(`/articles/${slug}`);
        return response.data.data as Article;
    },

    // Requires CONTRIBUTOR or ADMIN role (enforced server-side).
    create: async (payload: ArticlePayload): Promise<Article> => {
        const response = await api.post("/articles/", payload);
        return response.data.data as Article;
    },

    // Requires the author or an ADMIN (enforced server-side).
    update: async (
        slug: string,
        payload: Partial<ArticlePayload>,
    ): Promise<Article> => {
        const response = await api.put(`/articles/${slug}`, payload);
        return response.data.data as Article;
    },

    remove: async (slug: string): Promise<void> => {
        await api.delete(`/articles/${slug}`);
    },
};

export default articleService;
