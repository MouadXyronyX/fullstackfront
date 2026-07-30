import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineUser, HiOutlineTrash, HiOutlineBan, HiOutlineCheck, HiOutlineEye, HiOutlineKey } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { usersAPI } from '../../services/api';
import { User } from '../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHash, setShowHash] = useState<number | null>(null);
  const [resetPass, setResetPass] = useState<{ id: number; name: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    usersAPI.list()
      .then(res => setUsers(res.data))
      .catch(() => toast.error('فشل تحميل المستخدمين'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user: User) => {
    const newRole = user.role_id === 1 ? 2 : 1;
    try {
      await usersAPI.update(user.id, { role_id: newRole });
      toast.success(newRole === 1 ? 'تم الترقية إلى مدير' : 'تم التحويل إلى عميل');
      fetchUsers();
    } catch { toast.error('فشل التحديث'); }
  };

  const toggleActive = async (user: User) => {
    try {
      await usersAPI.update(user.id, { is_active: !user.is_active });
      toast.success(user.is_active ? 'تم التعطيل' : 'تم التفعيل');
      fetchUsers();
    } catch { toast.error('فشل التحديث'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try { await usersAPI.delete(id); toast.success('تم الحذف'); fetchUsers(); }
    catch { toast.error('فشل الحذف'); }
  };

  const handleResetPassword = async () => {
    if (!resetPass || !newPassword || newPassword.length < 6) {
      toast.error('كلمة السر يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    try {
      await usersAPI.resetPassword(resetPass.id, newPassword);
      toast.success('تم تغيير كلمة السر');
      setResetPass(null);
      setNewPassword('');
    } catch { toast.error('فشل تغيير كلمة السر'); }
  };

  if (loading) {
    return <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-dark-800 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold gold-text mb-6">الحسابات</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead><tr className="text-cream/40 text-sm border-b border-dark-700">
            <th className="pb-3 font-arabic">الاسم</th><th className="pb-3 font-arabic">البريد</th>
            <th className="pb-3 font-arabic">الهاتف</th><th className="pb-3 font-arabic">الدور</th>
            <th className="pb-3 font-arabic">الحالة</th><th className="pb-3 font-arabic">كلمة السر</th><th className="pb-3 font-arabic">الإجراءات</th>
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                <td className="py-3 text-cream font-semibold">{u.name}</td>
                <td className="py-3 text-cream/60 text-sm">{u.email || '—'}</td>
                <td className="py-3 text-cream/60 text-sm">{u.phone || '—'}</td>
                <td className="py-3">
                  <span className="flex items-center gap-1 text-sm">
                    {u.role_id === 1 ? <HiOutlineShieldCheck className="w-4 h-4 text-gold" /> : <HiOutlineUser className="w-4 h-4 text-cream/40" />}
                    <span className={u.role_id === 1 ? 'text-gold' : 'text-cream/60'}>{u.role_id === 1 ? 'مدير' : 'عميل'}</span>
                  </span>
                </td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {u.is_active ? 'نشط' : 'موقوف'}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowHash(showHash === u.id ? null : u.id)} className="p-1 text-cream/40 hover:text-gold" title="إظهار الهاش">
                      <HiOutlineEye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setResetPass({ id: u.id, name: u.name })} className="p-1 text-cream/40 hover:text-gold" title="تغيير كلمة السر">
                      <HiOutlineKey className="w-4 h-4" />
                    </button>
                  </div>
                  {showHash === u.id && (
                    <div className="mt-1 text-[10px] text-cream/30 font-mono break-all max-w-[200px] leading-tight" dir="ltr">
                      {(u as any).password_hash || '—'}
                    </div>
                  )}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleRole(u)} className="p-2 text-gold/60 hover:text-gold" title="تغيير الدور">
                      {u.role_id === 1 ? <HiOutlineUser className="w-4 h-4" /> : <HiOutlineShieldCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={() => toggleActive(u)} className="p-2 text-cream/40 hover:text-cream" title={u.is_active ? 'تعطيل' : 'تفعيل'}>
                      {u.is_active ? <HiOutlineBan className="w-4 h-4" /> : <HiOutlineCheck className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(u.id)} className="p-2 text-red-400/40 hover:text-red-400"><HiOutlineTrash className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {resetPass && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => { setResetPass(null); setNewPassword(''); }} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 md:inset-auto md:top-1/4 md:left-1/3 md:right-1/3 md:max-w-md md:mx-auto z-50 bg-dark-900 rounded-2xl p-6">
              <h2 className="text-lg font-arabic font-bold gold-text mb-4">تغيير كلمة السر</h2>
              <p className="text-cream/60 text-sm mb-4">المستخدم: <span className="text-cream font-semibold">{resetPass.name}</span></p>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field w-full mb-4" placeholder="كلمة السر الجديدة (6 أحرف على الأقل)" minLength={6} />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setResetPass(null); setNewPassword(''); }} className="dark-btn px-6 py-2">إلغاء</button>
                <button onClick={handleResetPassword} className="gold-btn px-6 py-2">حفظ</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
