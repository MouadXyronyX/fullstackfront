import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineEye, HiOutlineTrash, HiOutlinePhone, HiOutlineMail } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../services/api';
import { Order, OrderStatus, ORDER_STATUS_MAP } from '../../types';

const statusList: OrderStatus[] = ['pending', 'accepted', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = (silent = false) => {
    if (!silent) setLoading(true);
    const params: any = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    ordersAPI.list(params).then(res => setOrders(res.data)).catch(() => {}).finally(() => { if (!silent) setLoading(false); });
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 15 seconds instead of 5, and pause when tab is hidden
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchOrders(true);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      toast.success('تم تحديث الحالة');
      setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status: status as OrderStatus } : prev);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as OrderStatus } : o));
    } catch { toast.error('فشل التحديث'); }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد؟')) return;
    try { await ordersAPI.delete(id); toast.success('تم الحذف'); setOrders(prev => prev.filter(o => o.id !== id)); }
    catch { toast.error('فشل الحذف'); }
  };

  const statusCounts = (status: OrderStatus | 'all') =>
    status === 'all' ? orders.length : orders.filter(o => o.status === status).length;

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold gold-text mb-6">الطلبات</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {[{ key: 'all' as const, label: 'الكل' }, ...statusList.map(s => ({ key: s as OrderStatus | 'all', label: ORDER_STATUS_MAP[s] }))].map(({ key, label }) => (
          <button key={key} onClick={() => setStatusFilter(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-arabic transition-colors ${statusFilter === key ? 'bg-gold text-dark font-bold' : 'bg-dark-800 text-cream/60 hover:text-cream'}`}>
            {label} ({statusCounts(key)})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-16 bg-dark-800 animate-pulse rounded-lg" />)}</div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <table className="w-full text-right">
            <thead><tr className="text-cream/40 text-sm border-b border-dark-700 sticky top-0 bg-dark-900 z-10">
              <th className="pb-3 pt-3 font-arabic">الرمز</th><th className="pb-3 pt-3 font-arabic">العميل</th>
              <th className="pb-3 pt-3 font-arabic">الهاتف</th><th className="pb-3 pt-3 font-arabic">المجموع</th>
              <th className="pb-3 pt-3 font-arabic">الحالة</th><th className="pb-3 pt-3 font-arabic">التاريخ</th><th className="pb-3 pt-3 font-arabic"></th>
            </tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                  <td className="py-3 text-cream font-mono text-sm">{o.order_code}</td>
                  <td className="py-3 text-cream">{o.guest_name || '—'}</td>
                  <td className="py-3 text-cream/60">{o.guest_phone || '—'}</td>
                  <td className="py-3 gold-text">{o.total_price.toLocaleString()} د.ج</td>
                  <td className="py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${
                    o.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    o.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
                    o.status === 'preparing' ? 'bg-purple-500/20 text-purple-400' :
                    o.status === 'shipped' ? 'bg-cyan-500/20 text-cyan-400' :
                    o.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>{ORDER_STATUS_MAP[o.status as OrderStatus]}</span></td>
                  <td className="py-3 text-cream/40 text-sm">{o.created_at ? new Date(o.created_at).toLocaleDateString('ar-DZ') : '—'}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedOrder(o)} className="p-2 text-cream/40 hover:text-gold"><HiOutlineEye className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(o.id)} className="p-2 text-red-400/40 hover:text-red-400"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setSelectedOrder(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 md:inset-auto md:top-10 md:left-10 md:right-10 md:max-w-2xl md:mx-auto z-50 bg-dark-900 rounded-2xl overflow-y-auto max-h-[90vh]">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-arabic font-bold gold-text">طلب #{selectedOrder.order_code}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-cream/40 hover:text-gold">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-dark-800 rounded-lg">
                  <div><span className="text-cream/40 text-sm">العميل</span><p className="text-cream">{selectedOrder.guest_name || '—'}</p></div>
                  <div><span className="text-cream/40 text-sm">الهاتف</span><p className="text-cream flex items-center gap-1">{selectedOrder.guest_phone || '—'}
                    {selectedOrder.guest_phone && <a href={`tel:${selectedOrder.guest_phone}`} className="text-gold"><HiOutlinePhone className="w-4 h-4" /></a>}
                  </p></div>
                  <div><span className="text-cream/40 text-sm">البريد</span><p className="text-cream flex items-center gap-1">{selectedOrder.guest_email || '—'}
                    {selectedOrder.guest_email && <a href={`mailto:${selectedOrder.guest_email}`} className="text-gold"><HiOutlineMail className="w-4 h-4" /></a>}
                  </p></div>
                  <div><span className="text-cream/40 text-sm">الولاية / البلدية</span><p className="text-cream">{selectedOrder.wilaya} / {selectedOrder.commune}</p></div>
                  <div className="col-span-2"><span className="text-cream/40 text-sm">العنوان</span><p className="text-cream">{selectedOrder.address || '—'}</p></div>
                  {selectedOrder.note && <div className="col-span-2"><span className="text-cream/40 text-sm">ملاحظة</span><p className="text-cream">{selectedOrder.note}</p></div>}
                </div>

                <h3 className="font-arabic text-gold font-semibold mb-3">المنتجات</h3>
                <div className="space-y-2 mb-6">
                  {selectedOrder.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-dark-800 rounded-lg">
                      <div>
                        <p className="text-cream text-sm">{item.product_name || `منتج #${item.product_id}`}</p>
                        {item.variant_name && <p className="text-gold/70 text-xs">{item.variant_name}</p>}
                      </div>
                      <div className="text-left">
                        <p className="gold-text text-sm">{item.price_at_order.toLocaleString()} د.ج</p>
                        <p className="text-cream/40 text-xs">الكمية: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 p-4 bg-dark-800 rounded-lg mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-cream/60 font-arabic">المنتجات</span>
                    <span className="text-cream">{(selectedOrder.total_price - (selectedOrder.delivery_fee || 0)).toLocaleString()} د.ج</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-cream/60 font-arabic">التوصيل</span>
                    <span className="text-cream">{(selectedOrder.delivery_fee || 0).toLocaleString()} د.ج</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dark-700">
                    <span className="text-cream/60 font-arabic">المجموع</span>
                    <span className="gold-text font-bold text-xl">{selectedOrder.total_price.toLocaleString()} د.ج</span>
                  </div>
                </div>

                <h3 className="font-arabic text-gold font-semibold mb-3">تحديث الحالة</h3>
                <div className="flex flex-wrap gap-2">
                  {statusList.map(s => (
                    <button key={s} onClick={() => handleStatusChange(selectedOrder.id, s)}
                      disabled={selectedOrder.status === s}
                      className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedOrder.status === s ? 'bg-gold text-dark font-bold' : 'bg-dark-800 text-cream/60 hover:text-cream'
                      }`}>
                      {ORDER_STATUS_MAP[s]}
                    </button>
                  ))}
                </div>

                {selectedOrder.guest_phone && (
                  <a href={`https://wa.me/${selectedOrder.guest_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-400 text-sm mt-4 hover:text-green-300">
                    تواصل عبر واتساب
                  </a>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
