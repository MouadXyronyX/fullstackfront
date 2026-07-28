import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { pagesAPI } from '../../services/api';
import { Page } from '../../types';

export default function AdminPages() {
  const [pages, setPages] = useState<Page[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', slug: '', content: '', is_published: true });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  const load = () => pagesAPI.listAll().then(res => setPages(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm({ title: '', slug: '', content: '', is_published: true }); setPreview(false); setModalOpen(true); };
  const openEdit = (p: Page) => { setEditingId(p.id); setForm({ title: p.title, slug: p.slug, content: p.content || '', is_published: p.is_published }); setPreview(false); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    try {
      if (editingId) {
        await pagesAPI.update(editingId, form);
        toast.success('تم تحديث الصفحة');
      } else {
        await pagesAPI.create(form);
        toast.success('تم إنشاء الصفحة');
      }
      setModalOpen(false);
      load();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تأكيد حذف الصفحة؟')) return;
    try { await pagesAPI.delete(id); toast.success('تم الحذف'); load(); } catch {}
  };

  const generateSlug = (title: string) => title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-arabic font-bold gold-text">إدارة الصفحات</h1>
        <button onClick={openCreate} className="gold-btn flex items-center gap-2 text-sm"><HiOutlinePlus className="w-4 h-4" /> إضافة صفحة</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map(p => (
          <div key={p.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-arabic text-gold font-semibold">{p.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${p.is_published ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {p.is_published ? 'منشور' : 'مسودة'}
              </span>
            </div>
            <p className="text-xs text-cream/40 mb-3">/{p.slug}</p>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="text-cream/40 hover:text-gold text-sm flex items-center gap-1"><HiOutlinePencil className="w-3 h-3" /> تعديل</button>
              <button onClick={() => handleDelete(p.id)} className="text-red-400/60 hover:text-red-400 text-sm flex items-center gap-1"><HiOutlineTrash className="w-3 h-3" /> حذف</button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-dark-900 gold-border rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                  <h2 className="font-arabic text-lg gold-text font-bold">{editingId ? 'تعديل صفحة' : 'إضافة صفحة'}</h2>
                  <button onClick={() => setModalOpen(false)} className="text-cream/60 hover:text-gold"><HiOutlineX className="w-5 h-5" /></button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-cream/60 mb-1">العنوان *</label>
                      <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value, slug: editingId ? form.slug : generateSlug(e.target.value)})} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-1">الرابط (slug) *</label>
                      <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="input-field text-xs font-mono" dir="ltr" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_published} onChange={e => setForm({...form, is_published: e.target.checked})} className="accent-gold" />
                    <span className="text-sm text-cream/60">منشور</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-cream/60">المحتوى (HTML)</label>
                      <button onClick={() => setPreview(!preview)} className="text-gold text-xs flex items-center gap-1">
                        <HiOutlineEye className="w-3 h-3" /> {preview ? 'تعديل' : 'معاينة'}
                      </button>
                    </div>
                    {preview ? (
                      <div className="bg-dark-800 gold-border rounded-lg p-4 min-h-[300px] prose prose-invert max-w-none prose-headings:text-gold" dangerouslySetInnerHTML={{ __html: form.content }} />
                    ) : (
                      <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})}
                        className="input-field font-mono text-xs h-64" placeholder="<h2>عنوان</h2><p>محتوى الصفحة...</p>" />
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-dark-700 flex gap-3 justify-end">
                  <button onClick={() => setModalOpen(false)} className="dark-btn text-sm">إلغاء</button>
                  <button onClick={handleSave} disabled={saving} className="gold-btn text-sm">{saving ? 'جاري...' : 'حفظ'}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
