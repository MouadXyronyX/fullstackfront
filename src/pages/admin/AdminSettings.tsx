import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { settingsAPI } from '../../services/api';
import { GeneralSettings, DeliveryWilaya } from '../../types';
import { ALL_WILAYAS } from '../../data/locations';

export default function AdminSettings() {
  const [settings, setSettings] = useState<GeneralSettings>({
    store_name: '', store_description: '', facebook_url: '', instagram_url: '',
    whatsapp_number: '', phone: '', email: '', address: '', working_hours: '',
  });
  const [delivery, setDelivery] = useState<DeliveryWilaya[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [newWilayaCode, setNewWilayaCode] = useState('');
  const [newPrice, setNewPrice] = useState('');

  useEffect(() => {
    Promise.all([settingsAPI.getGeneral(), settingsAPI.getDeliveryWilayas()])
      .then(([g, d]) => {
        setSettings(g.data);
        setDelivery(Array.isArray(d.data) ? d.data : []);
      })
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

  const remainingWilayas = ALL_WILAYAS.filter(w => !delivery.some(d => d.code === w.code));

  const addWilaya = () => {
    if (!newWilayaCode) { toast.error('اختر ولاية'); return; }
    const w = ALL_WILAYAS.find(x => x.code === newWilayaCode);
    const price = parseFloat(newPrice);
    if (!w || isNaN(price) || price < 0) { toast.error('أدخل سعر توصيل صحيح'); return; }
    setDelivery(prev => [...prev, { code: w.code, ar_name: w.ar_name, price }]);
    setNewWilayaCode('');
    setNewPrice('');
  };

  const removeWilaya = (code: string) => {
    setDelivery(prev => prev.filter(d => d.code !== code));
  };

  const setPrice = (code: string, price: string) => {
    const p = parseFloat(price);
    setDelivery(prev => prev.map(d => d.code === code ? { ...d, price: isNaN(p) || p < 0 ? 0 : p } : d));
  };

  const saveDelivery = async () => {
    setSavingDelivery(true);
    try {
      await settingsAPI.updateDeliveryWilayas(delivery);
      toast.success('تم حفظ أسعار التوصيل');
    } catch {
      toast.error('فشل حفظ أسعار التوصيل');
    } finally {
      setSavingDelivery(false);
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1,2,3,4,5,6,7,8,9].map(i => <div key={i} className="h-12 bg-dark-800 animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-arabic font-bold gold-text">الإعدادات</h1>

      <div>
        <h2 className="font-arabic text-lg gold-text font-semibold mb-4">أسعار التوصيل حسب الولاية</h2>
        <div className="card p-6 max-w-3xl">
          <div className="flex gap-2 mb-4">
            <select value={newWilayaCode} onChange={e => setNewWilayaCode(e.target.value)} className="input-field flex-1">
              <option value="">اختر ولاية للإضافة</option>
              {remainingWilayas.map(w => (
                <option key={w.code} value={w.code}>{w.ar_name}</option>
              ))}
            </select>
            <input
              type="number" min="0" step="50" value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              placeholder="سعر التوصيل (د.ج)" className="input-field w-44"
            />
            <button type="button" onClick={addWilaya} className="gold-btn px-4">إضافة</button>
          </div>

          {delivery.length === 0 ? (
            <p className="text-cream/40 text-center py-6">لا توجد ولايات محددة بعد. أضف ولاية للبدء.</p>
          ) : (
            <div className="space-y-2">
              {delivery.map(d => (
                <div key={d.code} className="flex items-center gap-3 bg-dark-800 rounded-lg p-3">
                  <span className="font-arabic text-cream font-semibold flex-1">{d.ar_name}</span>
                  <input
                    type="number" min="0" step="50" value={d.price}
                    onChange={e => setPrice(d.code, e.target.value)}
                    className="input-field w-36 text-center"
                  />
                  <span className="text-cream/40 text-sm">د.ج</span>
                  <button
                    type="button"
                    onClick={() => removeWilaya(d.code)}
                    className="text-red-400 hover:text-red-300 px-2"
                    title="حذف الولاية"
                  >✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button type="button" onClick={saveDelivery} disabled={savingDelivery} className="gold-btn px-8 py-2">
              {savingDelivery ? 'جاري الحفظ...' : 'حفظ أسعار التوصيل'}
            </button>
            <p className="text-xs text-cream/40">تُضاف أسعار التوصيل تلقائيًا إلى إجمالي الطلب في صفحة إتمام الطلب</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl space-y-4">
        <h2 className="font-arabic text-lg gold-text font-semibold">معلومات المتجر</h2>
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
