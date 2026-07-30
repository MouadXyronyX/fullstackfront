import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      await login(form);
      toast.success('مرحباً بعودتك!');
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
            <h1 className="text-2xl font-arabic font-bold gold-text">تسجيل الدخول</h1>
            <p className="text-cream/50 text-sm mt-2">مرحباً بعودتك إلى اثاث القدس</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-cream/60 mb-1">البريد الإلكتروني أو الهاتف</label>
              <input
                type="text"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-cream/60 mb-1">كلمة السر</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  className="input-field w-full pl-10"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold">
                  {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="gold-btn w-full py-3">
              {loading ? 'جاري...' : 'تسجيل الدخول'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-cream/50">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-gold hover:text-gold-light">إنشاء حساب جديد</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
