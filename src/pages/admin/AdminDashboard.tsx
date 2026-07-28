import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiOutlineCube, HiOutlineCollection, HiOutlineShoppingBag, HiOutlineUsers, HiOutlineChatAlt2, HiOutlineCurrencyDollar } from 'react-icons/hi';
import { dashboardAPI } from '../../services/api';
import { DashboardStats, ORDER_STATUS_MAP, OrderStatus } from '../../types';

const statCards = [
  { key: 'total_products', label: 'المنتجات', icon: HiOutlineCube, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'total_categories', label: 'التصنيفات', icon: HiOutlineCollection, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { key: 'total_orders', label: 'إجمالي الطلبات', icon: HiOutlineShoppingBag, color: 'text-gold', bg: 'bg-gold/10' },
  { key: 'pending_orders', label: 'طلبات معلقة', icon: HiOutlineChatAlt2, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { key: 'total_customers', label: 'الزبائن', icon: HiOutlineUsers, color: 'text-green-400', bg: 'bg-green-500/10' },
  { key: 'total_revenue', label: 'الإيرادات (د.ج)', icon: HiOutlineCurrencyDollar, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    dashboardAPI.stats().then(res => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-arabic font-bold gold-text mb-6">لوحة التحكم</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/50 text-sm">{card.label}</p>
                <p className={`text-2xl font-bold mt-1 ${card.color}`}>
                  {stats ? (
                    card.key === 'total_revenue'
                      ? (stats as any)[card.key]?.toLocaleString() ?? 0
                      : (stats as any)[card.key] ?? 0
                  ) : '...'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <h2 className="font-arabic text-lg text-gold font-semibold mb-4">آخر الطلبات</h2>
        {stats?.recent_orders && stats.recent_orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-cream/40 border-b border-dark-700">
                  <th className="text-right py-2 px-3">الرمز</th>
                  <th className="text-right py-2 px-3">الزبون</th>
                  <th className="text-right py-2 px-3">المبلغ</th>
                  <th className="text-right py-2 px-3">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map(order => (
                  <tr key={order.id} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="py-3 px-3 font-mono text-gold text-xs">{order.order_code}</td>
                    <td className="py-3 px-3 text-cream/80">{order.customer}</td>
                    <td className="py-3 px-3 gold-text font-semibold">{order.total_price.toLocaleString()} د.ج</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-gold/10 text-gold">
                        {ORDER_STATUS_MAP[order.status as OrderStatus] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-cream/40 text-center py-8">لا توجد طلبات بعد</p>
        )}
        <div className="mt-4 text-center">
          <Link to="/portal-x9k2/orders" className="text-sm text-gold hover:text-gold-light">عرض جميع الطلبات →</Link>
        </div>
      </div>
    </div>
  );
}
