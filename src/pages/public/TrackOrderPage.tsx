import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineSearch, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineTruck, HiOutlineCube, HiOutlineClock, HiOutlineEmojiHappy } from 'react-icons/hi';
import IslamicDivider from '../../components/ui/IslamicDivider';
import { ordersAPI } from '../../services/api';
import { Order, ORDER_STATUS_MAP, OrderStatus } from '../../types';

const statusIcons: Record<OrderStatus, any> = {
  pending: HiOutlineClock,
  accepted: HiOutlineCheckCircle,
  preparing: HiOutlineCube,
  shipped: HiOutlineTruck,
  delivered: HiOutlineEmojiHappy,
  cancelled: HiOutlineXCircle,
};

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const statuses: OrderStatus[] = ['pending', 'accepted', 'preparing', 'shipped', 'delivered'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode || !phone) return;
    setSearching(true);
    setError('');
    setOrder(null);
    try {
      const res = await ordersAPI.track(orderCode, phone);
      setOrder(res.data);
    } catch {
      setError('لم يتم العثور على طلب بهذه المعلومات');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      <section className="relative pt-28 pb-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-arabic font-bold gold-text mb-2">تتبع طلبي</h1>
          <p className="text-cream/60 mb-8">أدخل رقم التتبع ورقم الهاتف لمتابعة حالة طلبك</p>
          <IslamicDivider />

          <form onSubmit={handleSearch} className="mt-8 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="رقم التتبع (مثال: AQ-XXXX1234)"
                value={orderCode}
                onChange={e => setOrderCode(e.target.value)}
                className="input-field flex-1 text-center font-mono"
                required
              />
              <input
                type="tel"
                placeholder="رقم الهاتف"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="input-field flex-1 text-center"
                required
              />
              <button type="submit" disabled={searching} className="gold-btn px-8 flex items-center justify-center gap-2">
                <HiOutlineSearch className="w-5 h-5" />
                {searching ? '...' : 'بحث'}
              </button>
            </div>
          </form>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 mt-4">
              {error}
            </motion.p>
          )}

          <AnimatePresence>
            {order && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
                <div className="card p-6 text-right">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-arabic text-xl gold-text font-bold">طلب #{order.order_code}</h2>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gold/20 text-gold">
                      {ORDER_STATUS_MAP[order.status as OrderStatus] || order.status}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="relative">
                    <div className="absolute right-2 top-0 bottom-0 w-0.5 bg-dark-700" />
                    <div className="space-y-6 relative">
                      {statuses.map((s, i) => {
                        const currentIdx = statuses.indexOf(order.status as OrderStatus);
                        const isCancelled = order.status === 'cancelled';
                        const isActive = statuses.indexOf(s) <= currentIdx && !isCancelled;
                        const Icon = statusIcons[s];

                        return (
                          <div key={s} className="flex items-center gap-3 pr-6">
                            <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center ${
                              isActive ? 'bg-gold text-dark' : 'bg-dark-700 text-cream/40'
                            }`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <div>
                              <p className={`text-sm font-medium ${isActive ? 'text-gold' : 'text-cream/40'}`}>
                                {ORDER_STATUS_MAP[s]}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {isCancelled(order.status) && (
                        <div className="flex items-center gap-3 pr-6">
                          <div className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center bg-red-500 text-white">
                            <HiOutlineXCircle className="w-3 h-3" />
                          </div>
                          <p className="text-sm font-medium text-red-400">ملغي</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-dark-700 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-cream/40">الاسم:</span>
                        <p className="text-cream">{order.guest_name}</p>
                      </div>
                      <div>
                        <span className="text-cream/40">الهاتف:</span>
                        <p className="text-cream">{order.guest_phone}</p>
                      </div>
                      <div>
                        <span className="text-cream/40">الولاية:</span>
                        <p className="text-cream">{order.wilaya}</p>
                      </div>
                      <div>
                        <span className="text-cream/40">البلدية:</span>
                        <p className="text-cream">{order.commune}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="text-cream/40 text-sm">الإجمالي: </span>
                    <span className="gold-text font-bold text-lg">{order.total_price.toLocaleString()} د.ج</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

function isCancelled(status: string): boolean {
  return status === 'cancelled';
}
