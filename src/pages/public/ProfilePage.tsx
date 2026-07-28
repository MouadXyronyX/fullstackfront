import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineClipboardList, HiOutlineChat, HiOutlineUser } from 'react-icons/hi';
import IslamicDivider from '../../components/ui/IslamicDivider';
import { useAuth } from '../../context/AuthContext';
import { ordersAPI } from '../../services/api';
import { Order, ORDER_STATUS_MAP, OrderStatus } from '../../types';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'info'>('orders');

  useEffect(() => {
    ordersAPI.myOrders().then(res => setOrders(res.data)).catch(() => {});
  }, []);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="pt-28 max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-arabic font-bold gold-text text-center mb-2">حسابي</h1>
      <IslamicDivider />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-4 space-y-2">
            <div className="p-3 bg-dark-700 rounded-lg text-center mb-4">
              <HiOutlineUser className="w-8 h-8 mx-auto text-gold mb-2" />
              <p className="font-arabic text-gold font-semibold">{user?.name}</p>
              <p className="text-xs text-cream/40">{user?.email}</p>
            </div>
            <button onClick={() => setActiveTab('orders')} className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'orders' ? 'bg-gold/10 text-gold' : 'text-cream/60 hover:text-gold'}`}>
              <HiOutlineClipboardList className="inline ml-2 w-4 h-4" />
              طلباتي
            </button>
            <button onClick={() => setActiveTab('info')} className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${activeTab === 'info' ? 'bg-gold/10 text-gold' : 'text-cream/60 hover:text-gold'}`}>
              <HiOutlineUser className="inline ml-2 w-4 h-4" />
              معلوماتي
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {orders.length === 0 ? (
                <div className="card p-12 text-center">
                  <p className="text-cream/40 text-lg font-arabic">لا توجد طلبات بعد</p>
                  <Link to="/products" className="gold-btn inline-block mt-4">تصفح المنتجات</Link>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-gold font-bold">#{order.order_code}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                        'bg-gold/20 text-gold'
                      }`}>
                        {ORDER_STATUS_MAP[order.status as OrderStatus]}
                      </span>
                    </div>
                    <div className="text-sm text-cream/60">
                      <span>{order.created_at ? new Date(order.created_at).toLocaleDateString('ar-DZ') : ''}</span>
                      <span className="mx-2">|</span>
                      <span>{order.items.length} منتجات</span>
                      <span className="mx-2">|</span>
                      <span className="gold-text font-semibold">{order.total_price.toLocaleString()} د.ج</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'info' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-6">
              <h2 className="font-arabic text-lg text-gold font-semibold mb-4">معلومات الحساب</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-cream/40">الاسم</label>
                  <p className="text-cream">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm text-cream/40">البريد الإلكتروني</label>
                  <p className="text-cream">{user?.email || '—'}</p>
                </div>
                <div>
                  <label className="block text-sm text-cream/40">رقم الهاتف</label>
                  <p className="text-cream">{user?.phone || '—'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
