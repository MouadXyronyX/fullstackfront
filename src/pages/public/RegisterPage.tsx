import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.password) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('تم إنشاء الحساب بنجاح!');
      navigate('/');
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-arabic font-bold gold-text">إنشاء حساب جديد</h1>
            <p className="text-cream/50 text-sm mt-2">انضم إلى اثاث القدس لتجربة تسوق أفضل</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cream/60 mb-1">الاسم الكامل *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm text-cream/60 mb-1">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-cream/60 mb-1">رقم الهاتف</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-cream/60 mb-1">كلمة السر *</label>
              <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" required minLength={6} />
            </div>
            <button type="submit" disabled={loading} className="gold-btn w-full py-3">
              {loading ? 'جاري...' : 'إنشاء حساب'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-cream/50">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-gold hover:text-gold-light">تسجيل الدخول</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
