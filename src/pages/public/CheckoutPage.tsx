import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineTrash, HiOutlineArrowRight } from 'react-icons/hi';
import IslamicDivider from '../../components/ui/IslamicDivider';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{ order_code: string } | null>(null);

  const [form, setForm] = useState({
    guest_name: '',
    guest_phone: '',
    guest_email: '',
    wilaya: '',
    commune: '',
    address: '',
    note: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        guest_name: user.name || prev.guest_name,
        guest_phone: user.phone || prev.guest_phone,
        guest_email: user.email || prev.guest_email,
      }));
    }
  }, [user, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.guest_name || !form.guest_phone || !form.wilaya || !form.commune) {
      toast.error('يرجى ملء الحقول الإلزامية');
      return;
    }
    setSubmitting(true);
    try {
      const orderData = {
        guest_name: form.guest_name,
        guest_phone: form.guest_phone,
        guest_email: form.guest_email || undefined,
        wilaya: form.wilaya,
        commune: form.commune,
        address: form.address || undefined,
        note: form.note || undefined,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_order: item.variant?.price ?? item.product.price,
          variant_id: item.variant?.id || undefined,
          variant_name: item.variant?.name || undefined,
        })),
      };
      const res = await ordersAPI.create(orderData);
      setOrderResult({ order_code: res.data.order_code });
      clearCart();
    } catch {
      toast.error('فشل إتمام الطلب. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <div className="pt-28 max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="card p-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-2xl font-arabic font-bold gold-text mb-2">تم استلام طلبك بنجاح!</h2>
          <p className="text-cream/60 mb-4">رقم التتبع الخاص بك هو</p>
          <p className="text-3xl font-mono font-bold text-cream mb-6">{orderResult.order_code}</p>
          <p className="text-cream/40 text-sm mb-6">يمكنك تتبع طلبك في أي وقت باستخدام هذا الرقم</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={`/track-order`} className="gold-btn px-8 py-3">تتبع الطلب</Link>
            <Link to="/" className="dark-btn px-8 py-3">العودة للرئيسية</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-28 max-w-2xl mx-auto px-4 py-16 text-center">
        <HiOutlineShoppingBag className="w-20 h-20 mx-auto text-cream/20 mb-4" />
        <h2 className="text-2xl font-arabic font-bold text-cream mb-2">السلة فارغة</h2>
        <p className="text-cream/40 mb-6">أضف منتجات إلى السلة للبدء</p>
        <Link to="/products" className="gold-btn px-8 py-3 inline-block">تصفح المنتجات</Link>
      </div>
    );
  }

  return (
    <div>
      <section className="relative pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-arabic font-bold gold-text text-center mb-2">إتمام الطلب</h1>
          <IslamicDivider />

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card p-6">
                <h2 className="font-arabic text-lg gold-text font-semibold mb-4">معلومات التوصيل</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-cream/60 mb-1 font-arabic">الاسم الكامل *</label>
                    <input type="text" value={form.guest_name} onChange={e => setForm({ ...form, guest_name: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1 font-arabic">رقم الهاتف *</label>
                    <input type="tel" value={form.guest_phone} onChange={e => setForm({ ...form, guest_phone: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1 font-arabic">البريد الإلكتروني</label>
                    <input type="email" value={form.guest_email} onChange={e => setForm({ ...form, guest_email: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1 font-arabic">الولاية *</label>
                    <input type="text" value={form.wilaya} onChange={e => setForm({ ...form, wilaya: e.target.value })} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1 font-arabic">البلدية *</label>
                    <input type="text" value={form.commune} onChange={e => setForm({ ...form, commune: e.target.value })} className="input-field" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-cream/60 mb-1 font-arabic">العنوان التفصيلي <span className="text-cream/30">(اختياري)</span></label>
                    <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field" rows={2} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-cream/60 mb-1 font-arabic">ملاحظة</label>
                    <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="input-field" rows={2} placeholder="أي ملاحظات إضافية..." />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-6">
                <h2 className="font-arabic text-lg gold-text font-semibold mb-4">ملخص الطلب</h2>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.variant?.id || ''}`} className="flex items-center gap-3 bg-dark-800 rounded-lg p-2">
                      <img src={item.product.images?.[0]?.image_url || ''} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-cream font-semibold truncate">{item.product.name}</p>
                        {item.variant && <p className="text-xs text-gold/70">{item.variant.name}</p>}
                        <p className="text-xs text-cream/60">{item.quantity} × {(item.variant?.price ?? item.product.price).toLocaleString()} د.ج</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dark-700 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-cream/60">المجموع</span>
                    <span className="gold-text font-bold text-xl">{totalPrice.toLocaleString()} د.ج</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-arabic text-lg gold-text font-semibold mb-4">طريقة الدفع</h2>
                <label className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg cursor-pointer">
                  <input type="radio" name="payment" checked readOnly className="accent-gold" />
                  <div>
                    <p className="text-sm text-cream font-semibold">الدفع عند الاستلام</p>
                    <p className="text-xs text-cream/40">ادفع نقدًا عند استلام الطلب</p>
                  </div>
                </label>
              </div>

              <button type="submit" disabled={submitting || items.length === 0} className="gold-btn w-full py-3 flex items-center justify-center gap-2">
                {submitting ? 'جاري المعالجة...' : 'تأكيد الطلب'}
                <HiOutlineArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
