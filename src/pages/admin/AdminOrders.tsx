import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineEye, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { ordersAPI } from '../../services/api';
import { Order, ORDER_STATUS_MAP, OrderStatus } from '../../types';

const statuses: OrderStatus[] = ['pending', 'accepted', 'preparing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState<string>('');
  const [updating, setUpdating] = useState<number | null>(null);

  const load = () => {
    const params: any = {};
    if (filter) params.status = filter;
    ordersAPI.list(params).then(res => setOrders(res.data)).catch(() => {});
  };
  useEffect(() => { load(); }, [filter]);

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdating(orderId);
    try {
      await ordersAPI.updateStatus(orderId, status);
      toast.success('تم تحديث الحالة');
      load();
      if (selectedOrder?.id === orderId) {
        const updated = orders.find(o => o.id === orderId);
        if (updated) setSelectedOrder({ ...updated, status: status as OrderStatus });
      }
    } catch {} finally { setUpdating(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('تأكيد حذف الطلب؟')) return;
    try { await ordersAPI.delete(id); toast.success('تم الحذف'); load(); setSelectedOrder(null); } catch {}
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      accepted: 'bg-blue-500/20 text-blue-400',
      preparing: 'bg-purple-500/20 text-purple-400',
      shipped: 'bg-cyan-500/20 text-cyan-400',
      delivered: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gold/20 text-gold';
  };

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold gold-text mb-6">إدارة الطلبات</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${!filter ? 'bg-gold/20 text-gold' : 'bg-dark-800 text-cream/60 hover:text-gold'}`}>الكل</button>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === s ? 'bg-gold/20 text-gold' : 'bg-dark-800 text-cream/60 hover:text-gold'}`}>
            {ORDER_STATUS_MAP[s]}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-cream/40 border-b border-dark-700 bg-dark-900">
                <th className="text-right py-3 px-4">الرمز</th>
                <th className="text-right py-3 px-4">الزبون</th>
                <th className="text-right py-3 px-4">الهاتف</th>
                <th className="text-right py-3 px-4">الإجمالي</th>
                <th className="text-right py-3 px-4">الحالة</th>
                <th className="text-right py-3 px-4">التاريخ</th>
                <th className="text-left py-3 px-4">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                  <td className="py-3 px-4 font-mono text-xs text-gold">#{order.order_code}</td>
                  <td className="py-3 px-4 text-cream/80">{order.guest_name || 'زبون مسجل'}</td>
                  <td className="py-3 px-4 text-cream/60" dir="ltr">{order.guest_phone}</td>
                  <td className="py-3 px-4 gold-text font-semibold">{order.total_price.toLocaleString()} د.ج</td>
                  <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>{ORDER_STATUS_MAP[order.status as OrderStatus]}</span></td>
                  <td className="py-3 px-4 text-cream/40 text-xs">{order.created_at ? new Date(order.created_at).toLocaleDateString('ar-DZ') : ''}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setSelectedOrder(order)} className="p-2 text-cream/40 hover:text-gold transition-colors"><HiOutlineEye className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(order.id)} className="p-2 text-cream/40 hover:text-red-400 transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-cream/40">لا توجد طلبات</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setSelectedOrder(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-dark-900 gold-border rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-dark-700">
                  <h2 className="font-arabic text-lg gold-text font-bold">تفاصيل الطلب #{selectedOrder.order_code}</h2>
                  <button onClick={() => setSelectedOrder(null)} className="text-cream/60 hover:text-gold"><HiOutlineX className="w-5 h-5" /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-cream/40">الاسم:</span><p className="text-cream">{selectedOrder.guest_name}</p></div>
                    <div><span className="text-cream/40">الهاتف:</span><p className="text-cream" dir="ltr">{selectedOrder.guest_phone}</p></div>
                    <div><span className="text-cream/40">الولاية:</span><p className="text-cream">{selectedOrder.wilaya}</p></div>
                    <div><span className="text-cream/40">البلدية:</span><p className="text-cream">{selectedOrder.commune}</p></div>
                    <div className="col-span-2"><span className="text-cream/40">العنوان:</span><p className="text-cream">{selectedOrder.address}</p></div>
                    {selectedOrder.note && <div className="col-span-2"><span className="text-cream/40">ملاحظة:</span><p className="text-cream">{selectedOrder.note}</p></div>}
                    {selectedOrder.guest_email && <div className="col-span-2"><span className="text-cream/40">البريد:</span><p className="text-cream">{selectedOrder.guest_email}</p></div>}
                  </div>

                  <div className="border-t border-dark-700 pt-4">
                    <h3 className="font-arabic text-gold font-semibold mb-2">تغيير الحالة</h3>
                    <div className="flex flex-wrap gap-2">
                      {statuses.map(s => (
                        <button key={s}
                          onClick={() => handleStatusChange(selectedOrder.id, s)}
                          disabled={updating === selectedOrder.id}
                          className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${selectedOrder.status === s ? 'bg-gold/30 text-gold' : 'bg-dark-800 text-cream/60 hover:text-gold'}`}
                        >
                          {ORDER_STATUS_MAP[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-dark-700 pt-4">
                    <h3 className="font-arabic text-gold font-semibold mb-2">المنتجات</h3>
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-dark-700 last:border-0">
                        <span className="text-cream/80 text-sm">{item.product_name || `منتج #${item.product_id}`}</span>
                        <span className="text-cream/60 text-xs">{item.quantity} × {item.price_at_order.toLocaleString()} د.ج</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3">
                      <span className="font-arabic text-gold">الإجمالي</span>
                      <span className="gold-text font-bold">{selectedOrder.total_price.toLocaleString()} د.ج</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <a href={`https://wa.me/${selectedOrder.guest_phone?.replace(/^0/, '213')}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 dark-btn text-xs text-center">واتساب</a>
                    <a href={`tel:${selectedOrder.guest_phone}`} className="flex-1 dark-btn text-xs text-center">اتصال</a>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
