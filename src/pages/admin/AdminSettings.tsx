import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../services/api';
import { GeneralSettings } from '../../types';

export default function AdminSettings() {
  const [settings, setSettings] = useState<GeneralSettings>({
    store_name: '', store_description: '', facebook_url: '', instagram_url: '',
    whatsapp_number: '', phone: '', email: '', address: '', working_hours: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.getGeneral()
      .then(res => setSettings(res.data))
      .catch(() => toast.error('فشل تحميل الإعدادات'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.updateGeneral(settings);
      toast.success('تم حفظ الإعدادات');
    } catch {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-12 bg-dark-800 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold gold-text mb-6">الإعدادات</h1>
      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-4">
        <div><label className="block text-sm text-cream/60 mb-1 font-arabic">اسم المتجر</label>
          <input type="text" value={settings.store_name} onChange={e => setSettings({ ...settings, store_name: e.target.value })} className="input-field" /></div>
        <div><label className="block text-sm text-cream/60 mb-1 font-arabic">وصف المتجر</label>
          <textarea value={settings.store_description} onChange={e => setSettings({ ...settings, store_description: e.target.value })} className="input-field" rows={3} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-sm text-cream/60 mb-1 font-arabic">رابط فيسبوك</label>
            <input type="text" value={settings.facebook_url} onChange={e => setSettings({ ...settings, facebook_url: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-cream/60 mb-1 font-arabic">رابط انستغرام</label>
            <input type="text" value={settings.instagram_url} onChange={e => setSettings({ ...settings, instagram_url: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-cream/60 mb-1 font-arabic">رقم واتساب</label>
            <input type="text" value={settings.whatsapp_number} onChange={e => setSettings({ ...settings, whatsapp_number: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-cream/60 mb-1 font-arabic">رقم الهاتف</label>
            <input type="text" value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-cream/60 mb-1 font-arabic">البريد الإلكتروني</label>
            <input type="email" value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm text-cream/60 mb-1 font-arabic">العنوان</label>
            <input type="text" value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} className="input-field" /></div>
        </div>
        <div><label className="block text-sm text-cream/60 mb-1 font-arabic">ساعات العمل</label>
          <input type="text" value={settings.working_hours} onChange={e => setSettings({ ...settings, working_hours: e.target.value })} className="input-field" placeholder="مثلاً: السبت - الخميس 9:00 - 18:00" /></div>
        <button type="submit" disabled={saving} className="gold-btn px-8 py-2">{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</button>
      </form>
    </div>
  );
}
