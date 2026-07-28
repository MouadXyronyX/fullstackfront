import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../services/api';
import { GeneralSettings } from '../../types';

export default function AdminSettings() {
  const [form, setForm] = useState<GeneralSettings>({
    store_name: '', store_description: '', facebook_url: '', instagram_url: '',
    whatsapp_number: '', phone: '', email: '', address: '', working_hours: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.getGeneral()
      .then(res => setForm(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsAPI.updateGeneral(form);
      toast.success('تم حفظ الإعدادات');
    } catch {} finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-16 bg-dark-800 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold gold-text mb-6">الإعدادات العامة</h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6 max-w-2xl">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cream/60 mb-1">اسم المتجر</label>
              <input type="text" value={form.store_name} onChange={e => setForm({...form, store_name: e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-cream/60 mb-1">رقم الهاتف</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-cream/60 mb-1">وصف المتجر</label>
            <textarea value={form.store_description} onChange={e => setForm({...form, store_description: e.target.value})} className="input-field h-20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cream/60 mb-1">رابط فيسبوك</label>
              <input type="text" value={form.facebook_url} onChange={e => setForm({...form, facebook_url: e.target.value})} className="input-field text-xs" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm text-cream/60 mb-1">رابط انستغرام</label>
              <input type="text" value={form.instagram_url} onChange={e => setForm({...form, instagram_url: e.target.value})} className="input-field text-xs" dir="ltr" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cream/60 mb-1">رقم واتساب</label>
              <input type="text" value={form.whatsapp_number} onChange={e => setForm({...form, whatsapp_number: e.target.value})} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm text-cream/60 mb-1">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-cream/60 mb-1">العنوان</label>
            <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-cream/60 mb-1">ساعات العمل</label>
            <input type="text" value={form.working_hours} onChange={e => setForm({...form, working_hours: e.target.value})} className="input-field" />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className="gold-btn mt-6 w-full py-3">
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </motion.div>
    </div>
  );
}
