import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShieldCheck, HiOutlineUser, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { usersAPI } from '../../services/api';
import { User } from '../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const load = () => usersAPI.list().then(res => setUsers(res.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const toggleRole = async (userId: number, currentRole: number) => {
    setUpdating(userId);
    try {
      const newRole = currentRole === 1 ? 2 : 1;
      await usersAPI.update(userId, { role_id: newRole });
      toast.success('تم تغيير الصلاحية');
      load();
    } catch {} finally { setUpdating(null); }
  };

  const toggleActive = async (userId: number, isActive: boolean) => {
    setUpdating(userId);
    try {
      await usersAPI.update(userId, { is_active: !isActive });
      toast.success(isActive ? 'تم التعطيل' : 'تم التفعيل');
      load();
    } catch {} finally { setUpdating(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تأكيد حذف الحساب؟')) return;
    try { await usersAPI.delete(id); toast.success('تم الحذف'); load(); } catch {}
  };

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold gold-text mb-6">إدارة الحسابات</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-cream/40 border-b border-dark-700 bg-dark-900">
                <th className="text-right py-3 px-4">الاسم</th>
                <th className="text-right py-3 px-4">البريد</th>
                <th className="text-right py-3 px-4">الهاتف</th>
                <th className="text-right py-3 px-4">الدور</th>
                <th className="text-right py-3 px-4">الحالة</th>
                <th className="text-left py-3 px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="py-3 px-4 text-cream/80">{u.name}</td>
                  <td className="py-3 px-4 text-cream/50 text-xs">{u.email || '—'}</td>
                  <td className="py-3 px-4 text-cream/50 text-xs" dir="ltr">{u.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 text-xs ${u.role_id === 1 ? 'text-gold' : 'text-cream/60'}`}>
                      {u.role_id === 1 ? <HiOutlineShieldCheck className="w-3 h-3" /> : <HiOutlineUser className="w-3 h-3" />}
                      {u.role_id === 1 ? 'مدير' : 'زبون'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${u.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.is_active ? 'نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => toggleRole(u.id, u.role_id)} disabled={updating === u.id}
                        className="text-xs text-cream/40 hover:text-gold transition-colors px-2 py-1 rounded border border-dark-700">
                        تبديل الدور
                      </button>
                      <button onClick={() => toggleActive(u.id, u.is_active)} disabled={updating === u.id}
                        className="text-xs text-cream/40 hover:text-orange-400 transition-colors">
                        {u.is_active ? 'تعطيل' : 'تفعيل'}
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="text-xs text-cream/40 hover:text-red-400 transition-colors">
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
