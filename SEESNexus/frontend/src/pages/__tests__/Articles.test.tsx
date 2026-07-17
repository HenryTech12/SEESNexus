import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Articles from "../Articles";
import articleService from "../../services/articleService";
import { useAuthStore } from "../../store/authStore";
import { UserRole, type Article } from "../../types";

vi.mock("../../services/articleService", () => ({
  default: { getAll: vi.fn(), remove: vi.fn() },
}));

const ownArticle: Article = {
  id: "a1",
  slug: "own-article",
  title: "My Own Article",
  content: "<p>content</p>",
  tags: [],
  status: "PUBLISHED",
  author_id: "user-1",
  author: { id: "user-1", full_name: "Author One" },
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const othersArticle: Article = {
  id: "a2",
  slug: "others-article",
  title: "Someone Elses Article",
  content: "<p>content</p>",
  tags: [],
  status: "PUBLISHED",
  author_id: "user-2",
  author: { id: "user-2", full_name: "Author Two" },
  created_at: "2026-01-02T00:00:00.000Z",
  updated_at: "2026-01-02T00:00:00.000Z",
};

const renderArticles = () =>
  render(
    <MemoryRouter>
      <Articles />
    </MemoryRouter>,
  );

describe("Articles — author/admin edit-delete authorization boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(articleService.getAll).mockResolvedValue({
      articles: [ownArticle, othersArticle],
      total: 2,
      pages: 1,
    });
  });

  afterEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it("shows edit/delete on your own article but not on someone else's, as a CONTRIBUTOR", async () => {
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "author1@test.com",
        full_name: "Author One",
        role: UserRole.CONTRIBUTOR,
        is_active: true,
      },
            isAuthenticated: true,
    });

    const user = userEvent.setup();
    renderArticles();

    await user.click(await screen.findByText("My Own Article"));
    expect(screen.getByLabelText("Edit article")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete article")).toBeInTheDocument();
  });

  it("hides edit/delete on someone else's article for a non-author CONTRIBUTOR", async () => {
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "author1@test.com",
        full_name: "Author One",
        role: UserRole.CONTRIBUTOR,
        is_active: true,
      },
            isAuthenticated: true,
    });

    const user = userEvent.setup();
    renderArticles();

    await user.click(await screen.findByText("Someone Elses Article"));
    expect(screen.queryByLabelText("Edit article")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Delete article")).not.toBeInTheDocument();
  });

  it("shows edit/delete on any article for an ADMIN, even when they aren't the author", async () => {
    useAuthStore.setState({
      user: {
        id: "admin-1",
        email: "admin@test.com",
        full_name: "Admin User",
        role: UserRole.ADMIN,
        is_active: true,
      },
            isAuthenticated: true,
    });

    const user = userEvent.setup();
    renderArticles();

    await user.click(await screen.findByText("Someone Elses Article"));
    expect(screen.getByLabelText("Edit article")).toBeInTheDocument();
    expect(screen.getByLabelText("Delete article")).toBeInTheDocument();
  });
});

describe("Articles — pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: "user-1",
        email: "author1@test.com",
        full_name: "Author One",
        role: UserRole.STUDENT,
        is_active: true,
      },
            isAuthenticated: true,
    });
  });

  afterEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it("requests page 1 initially and advances to page 2 on Next", async () => {
    vi.mocked(articleService.getAll).mockResolvedValue({
      articles: [ownArticle],
      total: 24,
      pages: 2,
    });

    const user = userEvent.setup();
    renderArticles();

    await screen.findByText("My Own Article");
    expect(articleService.getAll).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
    });

    await user.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() =>
      expect(articleService.getAll).toHaveBeenCalledWith({
        page: 2,
        limit: 12,
      }),
    );
  });
});
