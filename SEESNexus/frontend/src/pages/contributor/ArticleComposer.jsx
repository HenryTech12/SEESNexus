import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Save, Send, Image as ImageIcon, ArrowLeft, Eye, Trash2 } from 'lucide-react';
import articleService from '../../services/articleService';
import PageWrapper from '../../components/layout/PageWrapper';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const ArticleComposer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'TUTORIAL',
    cover_image: '',
    status: 'DRAFT'
  });

  const categories = ['TUTORIAL', 'NEWS', 'OPINION', 'RESEARCH', 'ANNOUNCEMENT'];

  useEffect(() => {
    if (slug) {
      const fetchArticle = async () => {
        try {
          setLoading(true);
          const article = await articleService.getBySlug(slug);
          setFormData({
            title: article.title,
            content: article.content,
            category: article.category || 'TUTORIAL',
            cover_image: article.cover_image || '',
            status: article.status
          });
        } catch (error) {
          toast.error('Failed to load article for editing');
          navigate('/articles');
        } finally {
          setLoading(false);
        }
      };
      fetchArticle();
    }
  }, [slug]);

  const handleSave = async (newStatus = 'DRAFT') => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      setSaving(true);
      const payload = { ...formData, status: newStatus };

      if (slug) {
        await articleService.update(slug, payload);
        toast.success(`Article ${newStatus.toLowerCase()} updated!`);
      } else {
        await articleService.create(payload);
        toast.success(`Article ${newStatus.toLowerCase()} successfully!`);
      }
      navigate('/articles');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save article');
    } finally {
      setSaving(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white">
                {slug ? 'Edit Insight' : 'New Technical Insight'}
              </h1>
              <p className="text-white/40 font-mono text-xs uppercase tracking-widest mt-1">
                {formData.status} MODE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              icon={Save}
              onClick={() => handleSave('DRAFT')}
              disabled={saving}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              icon={Send}
              onClick={() => handleSave('PUBLISHED')}
              disabled={saving}
              className="shadow-sees-glow"
            >
              Publish Now
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-2">
              <input
                type="text"
                placeholder="Article Title..."
                className="w-full bg-transparent p-6 text-3xl font-black text-white focus:outline-none placeholder:text-white/10"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="glass-card bg-white p-1 rounded-2xl overflow-hidden min-h-[500px]">
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                modules={quillModules}
                className="h-[450px] text-sees-void"
                placeholder="Compose your technical brilliance here..."
              />
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-8">
            <div className="glass-card p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Metadata & Media</h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all border ${
                          formData.category === cat ? 'bg-sees-mint border-sees-mint text-sees-void' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Cover Image URL</label>
                  <div className="relative group">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-sees-mint transition-colors" size={16} />
                    <input
                      type="text"
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-sees-mint transition-all"
                      value={formData.cover_image}
                      onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    />
                  </div>
                  {formData.cover_image && (
                    <div className="mt-4 rounded-xl overflow-hidden aspect-video border border-white/10">
                      <img src={formData.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-sees-forest/10 border-sees-forest/30">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Eye size={16} className="text-sees-mint" /> Editor Tips
              </h3>
              <ul className="space-y-3 text-[11px] text-white/60 leading-relaxed font-medium">
                <li className="flex gap-2"><span className="text-sees-mint">•</span> Use H2 for main sections.</li>
                <li className="flex gap-2"><span className="text-sees-mint">•</span> Include code blocks for technical steps.</li>
                <li className="flex gap-2"><span className="text-sees-mint">•</span> Keep cover images below 2MB.</li>
              </ul>
            </div>

            {slug && (
              <button
                onClick={() => toast.error('Delete functionality restricted to Admin')}
                className="w-full py-4 border border-red-900/30 text-red-400 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-400/10 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Delete Article
              </button>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ArticleComposer;
