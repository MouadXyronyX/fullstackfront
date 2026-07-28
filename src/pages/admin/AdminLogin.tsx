import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'login' | 'totp'>('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [totpCode, setTotpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await adminLogin(form);
      if (result.totp_required) {
        setUserId(result.user.id);
        setStep('totp');
      } else {
        toast.success('مرحباً بك يا مدير!');
        navigate('/portal-x9k2');
      }
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleTOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    try {
      const res = await authAPI.adminLoginTOTP(totpCode, userId);
      const { access_token, refresh_token, user: userData } = res.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success('تم التحقق بنجاح');
      navigate('/portal-x9k2');
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gold-border rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" className="text-gold">
                <path d="M20 2 L38 12 L38 28 L20 38 L2 28 L2 12 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
            <h1 className="text-xl font-arabic font-bold gold-text">لوحة التحكم</h1>
            <p className="text-cream/40 text-sm mt-1">تسجيل دخول المدير</p>
          </div>

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-cream/60 mb-1">البريد الإلكتروني</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm text-cream/60 mb-1">كلمة السر</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="input-field" required />
              </div>
              <button type="submit" disabled={loading} className="gold-btn w-full py-3">
                {loading ? 'جاري...' : 'دخول'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleTOTP} className="space-y-4">
              <p className="text-cream/60 text-sm text-center">أدخل رمز المصادقة الثنائية</p>
              <input
                type="text"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value)}
                placeholder="000000"
                className="input-field text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                required
              />
              <button type="submit" disabled={loading} className="gold-btn w-full py-3">
                {loading ? 'جاري...' : 'تحقق'}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
