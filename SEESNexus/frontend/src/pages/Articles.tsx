import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
import {
  Newspaper,
  X,
  Loader2,
  AlertCircle,
  Calendar,
  PenSquare,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Article } from "../types";
import { UserRole } from "../types";
import { MOCK_ARTICLES } from "../mocks/articles";
import AppLayout from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import articleService from "../services/articleService";
import { useAuthStore } from "../store/authStore";
import { formatError } from "../utils/errorHelper";
import { getItemImage } from "../utils/imageHelper";
import toast from "react-hot-toast";

const formatDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

const ARTICLES_PER_PAGE = 12;

const Articles = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const canWrite =
    user?.role === UserRole.CONTRIBUTOR || user?.role === UserRole.ADMIN;

  const [articles, setArticles] = useState<Article[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("ALL");
  const [mineOnly, setMineOnly] = useState(false);
  const [selected, setSelected] = useState<Article | null>(null);

  const fetchArticles = useCallback(async (targetPage: number) => {
    setIsLoading(true);
    try {
      const data = await articleService.getAll({
        page: targetPage,
        limit: ARTICLES_PER_PAGE,
      });
      setArticles(data.articles);
      setTotalPages(Math.max(data.pages, 1));
    } catch (error) {
      // Falls back to MOCK_ARTICLES below — silent, consistent with Hardware/Events.
      console.error("Failed to fetch articles:", error);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(page);
  }, [fetchArticles, page]);

  const sourceArticles = articles.length > 0 ? articles : MOCK_ARTICLES;

  // Tag/mine filters only narrow the current page's articles, not the whole
  // archive — true server-side filtering would need the backend's `tag`
  // query param wired in too, which is a reasonable next step but not
  // required to ship pagination itself.
  const tags = useMemo(
    () => Array.from(new Set(sourceArticles.flatMap((a) => a.tags))).sort(),
    [sourceArticles],
  );

  const handleDelete = async (article: Article) => {
    if (!window.confirm("Delete this article? This cannot be undone.")) return;
    try {
      await articleService.remove(article.slug);
      toast.success("Article deleted");
      setSelected(null);
      fetchArticles(page);
    } catch (err) {
      toast.error(formatError(err, "Failed to delete article"));
    }
  };

  const filteredArticles = sourceArticles
    .filter((a) => activeTag === "ALL" || a.tags.includes(activeTag))
    .filter((a) => !mineOnly || a.author_id === user?.id)
    .sort(
      (a, b) =>
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime(),
    );

  if (isLoading && articles.length === 0) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div>
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tighter mb-2 flex items-center gap-3">
              <Newspaper className="w-7 h-7 md:w-10 md:h-10 text-emerald-400" />
              NEXUS ARTICLES
            </h1>
            <p className="text-gray-400 max-w-2xl border-l-2 border-emerald-500/50 pl-4 py-1">
              Editorial dispatches from the SEES community — research notes,
              build logs, and field reports.
            </p>
          </div>
          {canWrite && (
            <Button
              onClick={() => navigate("/articles/new")}
              className="text-xs shrink-0"
            >
              <PenSquare className="w-4 h-4 mr-2" />
              Write Article
            </Button>
          )}
        </header>

        {/* Tag filter chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar">
          {["ALL", ...tags].map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-4 py-1.5 rounded-md text-xs whitespace-nowrap transition-all ${
                activeTag === tag
                  ? "bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
              }`}
            >
              {tag.toUpperCase()}
            </button>
          ))}
          {/* CONTRIBUTOR/ADMIN only — GET /articles/ already mixes the user's own
              drafts in with published articles, so this just narrows the same
              already-fetched list rather than triggering a second request. */}
          {canWrite && (
            <button
              onClick={() => setMineOnly((m) => !m)}
              className={`px-4 py-1.5 rounded-md text-xs whitespace-nowrap transition-all shrink-0 ${
                mineOnly
                  ? "bg-emerald-500 text-black font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30"
              }`}
            >
              MINE
            </button>
          )}
        </div>

        {/* Articles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => setSelected(article)}
                className="cursor-pointer"
              >
                <GlassCard className="h-full group hover:border-emerald-500/50 transition-all duration-500 overflow-hidden p-0">
                  <div className="relative h-40 overflow-hidden bg-emerald-900/20">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Newspaper className="w-10 h-10 text-emerald-500/10" />
                    </div>
                    <img
                      src={
                        article.cover_image_url ||
                        getItemImage(
                          `${article.title} engineering technology article cover`,
                          article.id,
                          400,
                          240,
                        )
                      }
                      alt={article.title}
                      loading="lazy"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-emerald-500 font-bold uppercase"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-emerald-400 transition-colors uppercase tracking-tight line-clamp-2">
                      {article.title}
                    </h3>
                    {article.excerpt && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 italic">
                        "{article.excerpt}"
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
                      <span className="font-bold">
                        {article.author.full_name}
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3" />
                        {formatDate(article.published_at || article.created_at)}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredArticles.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-xl">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400 font-mono">
              NO ARTICLES MATCHING THIS TAG
            </p>
          </div>
        )}

        {/* Paginates the server list itself — not the mock fallback, which
            always reports a single page. */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Prev
            </button>
            <span className="text-xs text-gray-500 font-mono">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
              onClick={() => setSelected(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="pointer-events-auto bg-[#080808] border border-emerald-500/20 rounded-xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              >
                <div className="relative h-56 flex-shrink-0 overflow-hidden bg-emerald-900/20">
                  <img
                    src={
                      selected.cover_image_url ||
                      getItemImage(
                        `${selected.title} engineering technology article cover`,
                        selected.id,
                        600,
                        300,
                      )
                    }
                    alt={selected.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-black/30 to-transparent" />
                  <button
                    onClick={() => setSelected(null)}
                    className="absolute top-4 right-4 p-1.5 bg-black/70 border border-white/10 rounded-md hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-8 space-y-6">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div className="flex flex-wrap gap-2">
                        {selected.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[10px] font-bold border bg-emerald-500/20 text-emerald-400 border-emerald-500/50 uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {(user?.id === selected.author_id ||
                        user?.role === UserRole.ADMIN) && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() =>
                              navigate(`/articles/${selected.slug}/edit`)
                            }
                            className="p-1.5 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                            aria-label="Edit article"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(selected)}
                            className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-md hover:bg-red-500/20 transition-colors text-red-400"
                            aria-label="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight mb-4">
                      {selected.title}
                    </h2>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 overflow-hidden">
                        <img
                          src={
                            selected.author.profile_image_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${selected.author.full_name}`
                          }
                          alt={selected.author.full_name}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {selected.author.full_name}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {formatDate(
                            selected.published_at || selected.created_at,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(selected.content),
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Articles;
