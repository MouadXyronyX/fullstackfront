import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
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

  // Redirect if cart empty
  if (items.length === 0 && !orderResult) {
    return (
      <div className="pt-28 max-w-7xl mx-auto px-4 py-16 text-center">
        <HiOutlineShoppingBag className="w-20 h-20 mx-auto text-cream/20 mb-4" />
        <h1 className="text-2xl font-arabic text-cream/60 mb-4">السلة فارغة</h1>
        <Link to="/products" className="gold-btn inline-block">تصفح المنتجات</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error('يرجى تأكيد أنك لست روبوتاً');
      return;
    }
    if (!form.guest_name || !form.guest_phone || !form.wilaya || !form.commune || !form.address) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    try {
      const res = await ordersAPI.create({
        ...form,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price_at_order: item.product.price,
        })),
        captcha_token: captchaToken,
      });
      setOrderResult({ order_code: res.data.order_code });
      clearCart();
      toast.success('تم إنشاء الطلب بنجاح!');
    } catch {
      // error handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  if (orderResult) {
    return (
      <div className="pt-28 max-w-lg mx-auto px-4 py-16 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineShoppingBag className="w-10 h-10 text-green-400" />
        </motion.div>
        <h1 className="text-3xl font-arabic font-bold gold-text mb-4">تم استلام طلبك</h1>
        <p className="text-cream/70 mb-6">رقم تتبع الطلب:</p>
        <div className="text-2xl font-mono font-bold gold-text bg-dark-800 gold-border rounded-xl p-4 mb-8">
          {orderResult.order_code}
        </div>
        <p className="text-cream/50 text-sm mb-8">احتفظ برقم التتبع لمتابعة حالة طلبك</p>
        <div className="flex gap-4 justify-center">
          <Link to="/track-order" className="gold-btn">تتبع الطلب</Link>
          <Link to="/" className="dark-btn">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative pt-28 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-arabic font-bold gold-text text-center mb-2">إتمام الطلب</h1>
          <IslamicDivider />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="lg:col-span-2 space-y-6"
            >
              <div className="card p-6">
                <h2 className="font-arabic text-lg text-gold font-semibold mb-4">معلومات التوصيل</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">الاسم الكامل *</label>
                    <input type="text" value={form.guest_name} onChange={e => setForm({...form, guest_name: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">رقم الهاتف *</label>
                    <input type="tel" value={form.guest_phone} onChange={e => setForm({...form, guest_phone: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">البريد الإلكتروني (اختياري)</label>
                    <input type="email" value={form.guest_email} onChange={e => setForm({...form, guest_email: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">الولاية *</label>
                    <input type="text" value={form.wilaya} onChange={e => setForm({...form, wilaya: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm text-cream/60 mb-1">البلدية *</label>
                    <input type="text" value={form.commune} onChange={e => setForm({...form, commune: e.target.value})} className="input-field" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-cream/60 mb-1">العنوان التفصيلي *</label>
                    <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field h-20" required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-cream/60 mb-1">ملاحظة للبائع (اختياري)</label>
                    <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} className="input-field h-20" />
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h2 className="font-arabic text-lg text-gold font-semibold mb-4">طريقة الدفع</h2>
                <div className="flex items-center gap-3 p-4 bg-dark-700 rounded-lg">
                  <input type="radio" checked readOnly className="accent-gold" />
                  <span className="text-cream">الدفع عند الاستلام (COD)</span>
                </div>
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'}
                  onChange={setCaptchaToken}
                  theme="dark"
                />
              </div>

              <button type="submit" disabled={submitting} className="gold-btn w-full text-lg py-4 flex items-center justify-center gap-2">
                {submitting ? 'جاري المعالجة...' : (
                  <>
                    تأكيد الطلب
                    <HiOutlineArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </motion.form>

            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="card p-6 sticky top-28">
                <h2 className="font-arabic text-lg text-gold font-semibold mb-4">ملخص الطلب</h2>
                <div className="space-y-3 mb-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex items-center gap-3">
                      <img
                        src={item.product.images?.[0]?.image_url || ''}
                        alt={item.product.name}
                        className="w-14 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-cream truncate">{item.product.name}</p>
                        <p className="text-xs text-cream/50">{item.quantity} × {item.product.price.toLocaleString()} د.ج</p>
                      </div>
                      <p className="text-sm text-cream font-semibold">{(item.product.price * item.quantity).toLocaleString()} د.ج</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-dark-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-arabic text-lg text-cream">المجموع</span>
                    <span className="gold-text text-xl font-bold">{totalPrice.toLocaleString()} د.ج</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
