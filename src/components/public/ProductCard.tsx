import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineEye } from 'react-icons/hi';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addItem } = useCart();
  const mainImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.is_available) return;
    addItem(product);
    toast.success('تمت الإضافة إلى السلة');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link to={`/products/${product.id}`} className="card group block">
        {/* Image */}
        <div className="relative h-56 md:h-64 overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />

          {/* Availability Badge */}
          {!product.is_available && (
            <span className="absolute top-3 right-3 px-3 py-1 bg-red-500/90 text-white text-xs rounded-full">
              غير متوفر
            </span>
          )}
          {product.is_available && (
            <span className="absolute top-3 right-3 px-3 py-1 bg-green-500/90 text-white text-xs rounded-full">
              متوفر
            </span>
          )}

          {/* Actions */}
          <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              disabled={!product.is_available}
              className="flex-1 gold-btn text-xs py-2 flex items-center justify-center gap-1"
            >
              <HiOutlineShoppingBag className="w-4 h-4" />
              أضف إلى السلة
            </button>
            <span className="flex items-center justify-center w-10 h-10 gold-border rounded-lg text-gold bg-dark-800/80">
              <HiOutlineEye className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-arabic text-base font-semibold text-cream mb-2 line-clamp-1 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="gold-text font-bold text-lg">{product.price.toLocaleString()} د.ج</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
