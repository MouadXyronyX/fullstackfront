import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineX, HiOutlinePlus, HiOutlineMinus, HiOutlineShoppingBag } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-16 h-16 gold-btn rounded-full flex items-center justify-center shadow-gold-hover"
      >
        <HiOutlineShoppingBag className="w-7 h-7" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-cream text-dark text-xs font-bold rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-md z-50 bg-dark-900 border-l border-dark-700 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-dark-700">
                <h2 className="font-arabic text-lg gold-text font-bold">سلة التسوق</h2>
                <button onClick={() => setIsOpen(false)} className="text-cream/60 hover:text-gold">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.length === 0 ? (
                  <div className="text-center text-cream/40 py-12">
                    <HiOutlineShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p className="font-arabic">السلة فارغة</p>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={`${item.product.id}-${item.variant?.id || ''}`} className="flex gap-3 bg-dark-800 rounded-lg p-3">
                      <img src={item.product.images?.[0]?.image_url || item.variant?.image_url || ''} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-arabic text-sm text-cream font-semibold truncate">{item.product.name}</h3>
                        {item.variant && (
                          <p className="text-xs text-gold/70 mt-0.5">{item.variant.name}</p>
                        )}
                        <p className="gold-text text-sm font-bold mt-1">
                          {(item.variant?.price ?? item.product.price).toLocaleString()} د.ج
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)} className="w-7 h-7 gold-border rounded flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-colors">
                            <HiOutlineMinus className="w-3 h-3" />
                          </button>
                          <span className="text-cream text-sm w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)} className="w-7 h-7 gold-border rounded flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-colors">
                            <HiOutlinePlus className="w-3 h-3" />
                          </button>
                          <button onClick={() => removeItem(item.product.id, item.variant?.id)} className="mr-auto text-red-400/60 hover:text-red-400 text-xs">حذف</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-dark-700 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-cream/60">المجموع:</span>
                    <span className="gold-text font-bold text-lg">{totalPrice.toLocaleString()} د.ج</span>
                  </div>
                  <Link to="/checkout" onClick={() => setIsOpen(false)} className="block gold-btn text-center w-full">
                    إتمام الطلب
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
