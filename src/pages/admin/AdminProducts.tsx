import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI } from '../../services/api';
import { Product, Category } from '../../types';

interface ProductForm {
  name: string;
  price: string;
  description: string;
  category_id: string;
  is_available: boolean;
  images: { image_url: string; order: number }[];
}

const emptyForm: ProductForm = {
  name: '', price: '', description: '', category_id: '', is_available: true, images: [{ image_url: '', order: 0 }],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = () => {
    const params: any = {};
    if (search) params.search = search;
    productsAPI.list(params).then(res => setProducts(res.data)).catch(() => {});
  };

  useEffect(() => {
    loadProducts();
    categoriesAPI.list().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => { loadProducts(); }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = async (id: number) => {
    try {
      const res = await productsAPI.get(id);
      const p = res.data;
      setEditingId(id);
      setForm({
        name: p.name,
        price: String(p.price),
        description: p.description || '',
        category_id: p.category_id ? String(p.category_id) : '',
        is_available: p.is_available,
        images: p.images?.length ? p.images.map((img: any) => ({ image_url: img.image_url, order: img.order })) : [{ image_url: '', order: 0 }],
      });
      setModalOpen(true);
    } catch {}
  };

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('الاسم والسعر مطلوبان');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...form,
        price: parseFloat(form.price),
        category_id: form.category_id ? parseInt(form.category_id) : null,
        images: form.images.filter(img => img.image_url.trim()),
      };

      if (editingId) {
        await productsAPI.update(editingId, data);
        toast.success('تم تحديث المنتج');
      } else {
        await productsAPI.create(data);
        toast.success('تم إنشاء المنتج');
      }
      setModalOpen(false);
      loadProducts();
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تأكيد حذف المنتج؟')) return;
    try {
      await productsAPI.delete(id);
      toast.success('تم حذف المنتج');
      loadProducts();
    } catch {}
  };

  const addImageField = () => setForm({ ...form, images: [...form.images, { image_url: '', order: form.images.length }] });
  const removeImageField = (i: number) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });
  const updateImage = (i: number, url: string) => {
    const images = [...form.images];
    images[i] = { ...images[i], image_url: url };
    setForm({ ...form, images });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-arabic font-bold gold-text">إدارة المنتجات</h1>
        <button onClick={openCreate} className="gold-btn flex items-center gap-2 text-sm">
          <HiOutlinePlus className="w-4 h-4" /> إضافة منتج
        </button>
      </div>

      <div className="relative mb-6">
        <HiOutlineSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
        <input type="text" placeholder="بحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-12" />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-cream/40 border-b border-dark-700 bg-dark-900">
                <th className="text-right py-3 px-4">الاسم</th>
                <th className="text-right py-3 px-4">السعر</th>
                <th className="text-right py-3 px-4">التصنيف</th>
                <th className="text-right py-3 px-4">التوفر</th>
                <th className="text-left py-3 px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="py-3 px-4 text-cream/80">{p.name}</td>
                  <td className="py-3 px-4 gold-text font-semibold">{p.price.toLocaleString()} د.ج</td>
                  <td className="py-3 px-4 text-cream/60 text-xs">{categories.find(c => c.id === p.category_id)?.name || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.is_available ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(p.id)} className="p-2 text-cream/40 hover:text-gold transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-cream/40 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-cream/40">لا توجد منتجات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-dark-900 gold-border rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                  <h2 className="font-arabic text-lg gold-text font-bold">{editingId ? 'تعديل منتج' : 'إضافة منتج'}</h2>
                  <button onClick={() => setModalOpen(false)} className="text-cream/60 hover:text-gold"><HiOutlineX className="w-5 h-5" /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">الاسم *</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-cream/60 mb-1">السعر (د.ج) *</label>
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm text-cream/60 mb-1">التصنيف</label>
                      <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} className="input-field">
                        <option value="">بدون تصنيف</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">الوصف</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field h-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="accent-gold" />
                    <span className="text-sm text-cream/60">متوفر</span>
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-2">روابط الصور</label>
                    {form.images.map((img, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input type="text" value={img.image_url} onChange={e => updateImage(i, e.target.value)} placeholder="رابط الصورة" className="input-field flex-1 text-xs" dir="ltr" />
                        {form.images.length > 1 && <button onClick={() => removeImageField(i)} className="text-red-400 text-xs">حذف</button>}
                      </div>
                    ))}
                    <button onClick={addImageField} className="text-gold text-sm">+ إضافة صورة</button>
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
