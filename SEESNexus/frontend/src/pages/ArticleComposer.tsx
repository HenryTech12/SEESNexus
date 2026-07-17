import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  ArrowLeft,
  Save,
  Send,
  Trash2,
  ImageIcon,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import AppLayout from "../components/layout/AppLayout";
import { GlassCard } from "../components/ui/GlassCard";
import { Button } from "../components/ui/Button";
import articleService from "../services/articleService";
import uploadService from "../services/uploadService";
import { formatError } from "../utils/errorHelper";
import type { ArticleStatus } from "../types";
import toast from "react-hot-toast";

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "code-block"],
    ["clean"],
  ],
};

const ArticleComposer = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(!!slug);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(
    null,
  );

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  // The confirmed, uploaded URL — this is what actually gets submitted.
  const [coverImageUrl, setCoverImageUrl] = useState("");
  // A local blob: preview shown while uploading or after a failed upload,
  // so the picked image stays visible instead of vanishing on error.
  const [localPreviewUrl, setLocalPreviewUrl] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ArticleStatus>("DRAFT");
  // Bumped on every image pick so a slow, superseded upload's response can't
  // clobber state set by a later pick (see runUpload).
  const uploadRequestIdRef = useRef(0);

  useEffect(() => {
    if (!slug) return;
    articleService
      .getBySlug(slug)
      .then((article) => {
        setTitle(article.title);
        setContent(article.content);
        setExcerpt(article.excerpt || "");
        setTagsInput(article.tags.join(", "));
        setCoverImageUrl(article.cover_image_url || "");
        setStatus(article.status);
      })
      .catch((err) => {
        toast.error(formatError(err, "Failed to load article for editing"));
        navigate("/articles");
      })
      .finally(() => setIsLoading(false));
  }, [slug, navigate]);

  // Revoke the blob: preview on unmount or whenever it's replaced.
  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const runUpload = async (file: File, requestId: number) => {
    setIsUploadingImage(true);
    setImageUploadError(null);
    try {
      const { url } = await uploadService.uploadImage(file);
      // A newer pick superseded this one while it was in flight — drop the
      // stale result instead of overwriting the newer selection's state.
      if (uploadRequestIdRef.current !== requestId) return;
      setCoverImageUrl(url);
      setLocalPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return "";
      });
      setPendingFile(null);
    } catch (err) {
      if (uploadRequestIdRef.current !== requestId) return;
      // Keep the local preview visible on failure instead of clearing it —
      // otherwise the picked image just seems to vanish with no feedback.
      setImageUploadError(formatError(err, "Image upload failed"));
    } finally {
      if (uploadRequestIdRef.current === requestId) setIsUploadingImage(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setPendingFile(file);
    const requestId = ++uploadRequestIdRef.current;
    runUpload(file, requestId);
  };

  const handleRetryUpload = () => {
    if (pendingFile) runUpload(pendingFile, ++uploadRequestIdRef.current);
  };

  const handleRemoveImage = () => {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl("");
    setPendingFile(null);
    setCoverImageUrl("");
    setImageUploadError(null);
  };

  const displayedImageUrl = localPreviewUrl || coverImageUrl;

  const handleSave = async (newStatus: ArticleStatus) => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }
    // Unlike hardware/event photos, a cover is required here — Pollination's
    // fallback only has the title to go on and often won't match the content.
    if (!coverImageUrl && !pendingFile) {
      toast.error("A cover image is required");
      return;
    }
    if (pendingFile) {
      toast.error(
        imageUploadError
          ? "Cover image failed to upload — retry or remove it before saving"
          : "Cover image is still uploading — please wait",
      );
      return;
    }

    const payload = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || undefined,
      cover_image_url: coverImageUrl || undefined,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: newStatus,
    };

    setIsSaving(true);
    try {
      if (slug) {
        await articleService.update(slug, payload);
        toast.success(
          newStatus === "PUBLISHED" ? "Article published!" : "Draft saved!",
        );
      } else {
        await articleService.create(payload);
        toast.success(
          newStatus === "PUBLISHED" ? "Article published!" : "Draft saved!",
        );
      }
      navigate("/articles");
    } catch (err) {
      toast.error(formatError(err, "Failed to save article"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slug) return;
    if (!window.confirm("Delete this article? This cannot be undone.")) return;

    try {
      await articleService.remove(slug);
      toast.success("Article deleted");
      navigate("/articles");
    } catch (err) {
      toast.error(formatError(err, "Failed to delete article"));
    }
  };

  if (isLoading) {
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
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/articles")}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
                {slug ? "EDIT ARTICLE" : "NEW ARTICLE"}
              </h1>
              <p className="text-emerald-500 font-mono text-xs uppercase tracking-widest mt-1">
                {status} MODE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handleSave("DRAFT")}
              isLoading={isSaving}
              className="text-xs"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSave("PUBLISHED")}
              isLoading={isSaving}
              className="text-xs"
            >
              <Send className="w-4 h-4 mr-2" />
              Publish Now
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest px-4 pt-2">
                Title
              </label>
              <input
                type="text"
                placeholder="Article title..."
                className="w-full bg-transparent p-4 pt-1 text-2xl font-black focus:outline-none placeholder:text-white/20"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </GlassCard>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                Content
              </label>
              <div className="bg-white rounded-xl overflow-hidden min-h-[420px]">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  className="h-[400px] text-black"
                  placeholder="Write your article..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar settings */}
          <div className="space-y-6">
            <GlassCard className="space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-300 border-b border-white/10 pb-3">
                Metadata & Media
              </h3>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                  Excerpt
                </label>
                <textarea
                  rows={3}
                  placeholder="Short summary shown on the article card..."
                  className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none resize-none transition-all placeholder:text-gray-600"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="IoT, embedded, Nigeria"
                  className="w-full bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-gray-600"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">
                  Cover Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full flex items-center justify-center gap-2 bg-black/40 border border-emerald-500/20 rounded-md p-3 text-sm hover:border-emerald-500/50 transition-all disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                  )}
                  {isUploadingImage ? "Uploading..." : "Choose Image"}
                </button>
                {displayedImageUrl && (
                  <div className="mt-3 relative rounded-md overflow-hidden aspect-video border border-white/10">
                    <img
                      src={displayedImageUrl}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-black/70 border border-white/10 rounded-md hover:bg-white/10 transition-colors"
                      aria-label="Remove cover image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {imageUploadError && (
                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3">
                    <span>{imageUploadError}</span>
                    <button
                      type="button"
                      onClick={handleRetryUpload}
                      className="shrink-0 flex items-center gap-1 font-bold hover:text-red-300"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Retry
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>

            {slug && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full py-3 border border-red-900/30 text-red-400 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-red-400/10 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete Article
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ArticleComposer;
