import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch, HiOutlinePhotograph } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { productsAPI, categoriesAPI, uploadAPI } from '../../services/api';
import { Product, ProductVariant, Category } from '../../types';

interface ProductForm {
  name: string; price: string; description: string; category_id: string; is_available: boolean;
  images: { image_url: string; order: number }[];
  variants: { name: string; price: string; image_url: string; is_available: boolean }[];
}

const emptyForm: ProductForm = {
  name: '', price: '', description: '', category_id: '', is_available: true,
  images: [{ image_url: '', order: 0 }],
  variants: [{ name: '', price: '', image_url: '', is_available: true }],
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>({ ...emptyForm });
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadingVariantIdx, setUploadingVariantIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const variantFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const fetchProducts = () => {
    setLoading(true);
    const params: any = { limit: 200 };
    if (search) params.search = search;
    productsAPI.list(params).then(res => setProducts(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, [search]);
  useEffect(() => { categoriesAPI.list().then(res => setCategories(res.data)).catch(() => {}); }, []);

  const openCreate = () => { setEditingId(null); setForm({ ...emptyForm }); setShowModal(true); };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, price: String(p.price), description: p.description || '', category_id: String(p.category_id || ''),
      is_available: p.is_available,
      images: p.images.length ? p.images.map(i => ({ image_url: i.image_url, order: i.order })) : [{ image_url: '', order: 0 }],
      variants: p.variants?.length ? p.variants.map(v => ({
        name: v.name, price: v.price ? String(v.price) : '', image_url: v.image_url || '',
        is_available: v.is_available,
      })) : [{ name: '', price: '', image_url: '', is_available: true }],
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) { toast.error('الاسم والسعر مطلوبان'); return; }
    const data = {
      name: form.name, price: parseFloat(form.price),
      description: form.description || undefined,
      category_id: form.category_id ? parseInt(form.category_id) : undefined,
      is_available: form.is_available,
      images: form.images.filter(i => i.image_url.trim()).map((i, idx) => ({ image_url: i.image_url.trim(), order: i.order || idx })),
      variants: form.variants.filter(v => v.name.trim()).map(v => ({
        name: v.name.trim(), price: v.price ? parseFloat(v.price) : undefined,
        image_url: v.image_url.trim() || undefined, is_available: v.is_available,
      })),
    };
    try {
      if (editingId) {
        await productsAPI.update(editingId, data);
        toast.success('تم تحديث المنتج');
      } else {
        await productsAPI.create(data);
        toast.success('تم إنشاء المنتج');
      }
      setShowModal(false);
      fetchProducts();
    } catch { toast.error('فشل الحفظ'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    try { await productsAPI.delete(id); toast.success('تم الحذف'); fetchProducts(); }
    catch { toast.error('فشل الحذف'); }
  };

  const handleImageUpload = async (idx: number, file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('يُسمح فقط بملفات الصور'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('حجم الصورة يتجاوز 5 ميغابايت'); return; }

    setUploadingIdx(idx);
    try {
      const res = await uploadAPI.image(file);
      const imgs = [...form.images];
      imgs[idx] = { ...imgs[idx], image_url: res.data.image_url };
      setForm({ ...form, images: imgs });
      toast.success('تم رفع الصورة بنجاح');
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploadingIdx(null);
    }
  };

  const triggerFileInput = (idx: number) => {
    fileInputRefs.current[idx]?.click();
  };

  const handleVariantImageUpload = async (idx: number, file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('يُسمح فقط بملفات الصور'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('حجم الصورة يتجاوز 5 ميغابايت'); return; }

    setUploadingVariantIdx(idx);
    try {
      const res = await uploadAPI.image(file);
      updateVariant(idx, 'image_url', res.data.image_url);
      toast.success('تم رفع صورة النوع بنجاح');
    } catch {
      toast.error('فشل رفع الصورة');
    } finally {
      setUploadingVariantIdx(null);
    }
  };

  const triggerVariantFileInput = (idx: number) => {
    variantFileInputRefs.current[idx]?.click();
  };

  const addImage = () => setForm({ ...form, images: [...form.images, { image_url: '', order: form.images.length }] });
  const removeImage = (idx: number) => { if (form.images.length > 1) setForm({ ...form, images: form.images.filter((_, i) => i !== idx) }); };

  const updateVariant = (idx: number, key: string, val: any) => {
    const vars = [...form.variants];
    (vars[idx] as any)[key] = val;
    setForm({ ...form, variants: vars });
  };

  const addVariant = () => setForm({ ...form, variants: [...form.variants, { name: '', price: '', image_url: '', is_available: true }] });
  const removeVariant = (idx: number) => { if (form.variants.length > 1) setForm({ ...form, variants: form.variants.filter((_, i) => i !== idx) }); };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-arabic font-bold gold-text">المنتجات</h1>
        <button onClick={openCreate} className="gold-btn flex items-center gap-2"><HiOutlinePlus className="w-5 h-5" /> إضافة منتج</button>
      </div>

      <div className="relative mb-6">
        <HiOutlineSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
        <input type="text" placeholder="ابحث عن منتج..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pr-12" />
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-dark-800 animate-pulse rounded-lg" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-cream/40">لا توجد منتجات</div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <table className="w-full text-right">
            <thead><tr className="text-cream/40 text-sm border-b border-dark-700 sticky top-0 bg-dark-900 z-10">
              <th className="pb-3 pt-3 font-arabic">الاسم</th><th className="pb-3 pt-3 font-arabic">السعر</th>
              <th className="pb-3 pt-3 font-arabic">التصنيف</th><th className="pb-3 pt-3 font-arabic">الحالة</th><th className="pb-3 pt-3 font-arabic">الإجراءات</th>
            </tr></thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="py-3 text-cream font-semibold">{p.name}</td>
                  <td className="py-3 gold-text">{p.price.toLocaleString()} د.ج</td>
                  <td className="py-3 text-cream/60">{categories.find(c => c.id === p.category_id)?.name || '-'}</td>
                  <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${p.is_available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{p.is_available ? 'متوفر' : 'غير متوفر'}</span></td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-blue-400/60 hover:text-blue-400"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-400/60 hover:text-red-400"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 md:inset-auto md:top-10 md:left-10 md:right-10 md:max-w-3xl md:mx-auto z-50 bg-dark-900 rounded-2xl overflow-y-auto max-h-[90vh]">
              <div className="p-6">
                <h2 className="text-xl font-arabic font-bold gold-text mb-6">{editingId ? 'تعديل منتج' : 'إضافة منتج'}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div><label className="block text-sm text-cream/60 mb-1 font-arabic">الاسم *</label><input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
                  <div><label className="block text-sm text-cream/60 mb-1 font-arabic">السعر *</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="input-field" /></div>
                  <div><label className="block text-sm text-cream/60 mb-1 font-arabic">التصنيف</label>
                    <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="input-field">
                      <option value="">بدون تصنيف</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div><label className="block text-sm text-cream/60 mb-1 font-arabic">الحالة</label>
                    <select value={form.is_available ? 'true' : 'false'} onChange={e => setForm({ ...form, is_available: e.target.value === 'true' })} className="input-field">
                      <option value="true">متوفر</option><option value="false">غير متوفر</option>
                    </select>
                  </div>
                  <div className="md:col-span-2"><label className="block text-sm text-cream/60 mb-1 font-arabic">الوصف</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} /></div>
                </div>

                <div className="mb-6">
                  <h3 className="font-arabic text-gold font-semibold mb-2">الصور</h3>
                  {form.images.map((img, idx) => (
                    <div key={idx} className="flex flex-col gap-2 mb-3 p-3 bg-dark-800 rounded-lg">
                      {img.image_url ? (
                        <div className="flex items-center gap-3">
                          <img src={img.image_url} alt={`صورة ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-dark-600" />
                          <div className="flex-1">
                            <p className="text-cream/60 text-xs truncate max-w-[250px]">{img.image_url}</p>
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => triggerFileInput(idx)} className="text-gold text-sm">تغيير الصورة</button>
                              {form.images.length > 1 && <button onClick={() => removeImage(idx)} className="text-red-400 text-sm">حذف</button>}
                            </div>
                          </div>
                          {uploadingIdx === idx && <span className="text-gold text-xs animate-pulse">جاري الرفع...</span>}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => triggerFileInput(idx)}
                            disabled={uploadingIdx === idx}
                            className="w-20 h-20 border-2 border-dashed border-dark-600 rounded-lg flex items-center justify-center text-cream/30 hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
                          >
                            {uploadingIdx === idx ? (
                              <span className="text-xs animate-pulse">...</span>
                            ) : (
                              <HiOutlinePhotograph className="w-6 h-6" />
                            )}
                          </button>
                          <div className="flex-1">
                            <button onClick={() => triggerFileInput(idx)} disabled={uploadingIdx === idx} className="text-gold text-sm disabled:opacity-50">
                              {uploadingIdx === idx ? 'جاري الرفع...' : 'اختر صورة من الجهاز'}
                            </button>
                            {form.images.length > 1 && <button onClick={() => removeImage(idx)} className="text-red-400 text-sm mr-3">حذف</button>}
                          </div>
                        </div>
                      )}
                      <input
                        ref={el => { fileInputRefs.current[idx] = el; }}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(idx, file);
                          e.target.value = '';
                        }}
                      />
                    </div>
                  ))}
                  <button onClick={addImage} className="text-gold text-sm mt-1">+ إضافة صورة</button>
                </div>

                <div className="mb-6">
                  <h3 className="font-arabic text-gold font-semibold mb-2">الأنواع / الأصناف</h3>
                  <p className="text-cream/40 text-xs mb-3">أضف أنواعًا مختلفة للمنتج (مثل: لون، حجم، خامة) — اختياري</p>
                  {form.variants.map((v, idx) => (
                    <div key={idx} className="flex flex-wrap gap-2 mb-3 p-3 bg-dark-800 rounded-lg">
                      <input type="text" value={v.name} onChange={e => updateVariant(idx, 'name', e.target.value)} className="input-field flex-1 min-w-[120px]" placeholder="اسم النوع (مثل: الأحمر)" />
                      <input type="number" value={v.price} onChange={e => updateVariant(idx, 'price', e.target.value)} className="input-field w-28" placeholder="السعر" />
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        {v.image_url ? (
                          <img src={v.image_url} alt={v.name || 'صورة النوع'} className="w-10 h-10 object-cover rounded-lg border border-dark-600" />
                        ) : (
                          <div className="w-10 h-10 border-2 border-dashed border-dark-600 rounded-lg flex items-center justify-center text-cream/30">
                            <HiOutlinePhotograph className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <button onClick={() => triggerVariantFileInput(idx)} disabled={uploadingVariantIdx === idx} className="text-gold text-sm disabled:opacity-50">
                            {uploadingVariantIdx === idx ? 'جاري الرفع...' : v.image_url ? 'تغيير الصورة' : 'اختر صورة من الجهاز'}
                          </button>
                        </div>
                        <input
                          ref={el => { variantFileInputRefs.current[idx] = el; }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) handleVariantImageUpload(idx, file);
                            e.target.value = '';
                          }}
                        />
                      </div>
                      <select value={v.is_available ? 'true' : 'false'} onChange={e => updateVariant(idx, 'is_available', e.target.value === 'true')} className="input-field w-24">
                        <option value="true">متوفر</option><option value="false">غير متوفر</option>
                      </select>
                      {form.variants.length > 1 && <button onClick={() => removeVariant(idx)} className="text-red-400 text-sm px-2">✕</button>}
                    </div>
                  ))}
                  <button onClick={addVariant} className="text-gold text-sm mt-1">+ إضافة نوع</button>
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowModal(false)} className="dark-btn px-6 py-2">إلغاء</button>
                  <button onClick={handleSubmit} className="gold-btn px-6 py-2">{editingId ? 'تحديث' : 'إنشاء'}</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
