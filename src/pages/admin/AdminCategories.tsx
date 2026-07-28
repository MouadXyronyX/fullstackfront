import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { categoriesAPI } from '../../services/api';
import { Category } from '../../types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '' });
  const [saving, setSaving] = useState(false);

  const load = () => categoriesAPI.list().then(res => setCategories(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm({ name: '', description: '', image_url: '' }); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditingId(cat.id); setForm({ name: cat.name, description: cat.description || '', image_url: cat.image_url || '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editingId) {
        await categoriesAPI.update(editingId, form);
        toast.success('تم تحديث التصنيف');
      } else {
        await categoriesAPI.create(form);
        toast.success('تم إنشاء التصنيف');
      }
      setModalOpen(false);
      load();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تأكيد حذف التصنيف؟')) return;
    try { await categoriesAPI.delete(id); toast.success('تم الحذف'); load(); } catch {}
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-arabic font-bold gold-text">إدارة التصنيفات</h1>
        <button onClick={openCreate} className="gold-btn flex items-center gap-2 text-sm"><HiOutlinePlus className="w-4 h-4" /> إضافة تصنيف</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="card p-4">
            {cat.image_url && <img src={cat.image_url} alt={cat.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
            <h3 className="font-arabic text-gold font-semibold mb-1">{cat.name}</h3>
            {cat.description && <p className="text-cream/50 text-xs mb-3">{cat.description}</p>}
            <div className="flex gap-2">
              <button onClick={() => openEdit(cat)} className="text-cream/40 hover:text-gold text-sm flex items-center gap-1"><HiOutlinePencil className="w-3 h-3" /> تعديل</button>
              <button onClick={() => handleDelete(cat.id)} className="text-red-400/60 hover:text-red-400 text-sm flex items-center gap-1"><HiOutlineTrash className="w-3 h-3" /> حذف</button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-dark-900 gold-border rounded-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                  <h2 className="font-arabic text-lg gold-text font-bold">{editingId ? 'تعديل تصنيف' : 'إضافة تصنيف'}</h2>
                  <button onClick={() => setModalOpen(false)} className="text-cream/60 hover:text-gold"><HiOutlineX className="w-5 h-5" /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">الاسم *</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">الوصف (اختياري)</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">رابط الصورة (اختياري)</label>
                    <input type="text" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="input-field" dir="ltr" />
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
