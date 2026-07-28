import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, FreeMode } from 'swiper/modules';
import { HiOutlineShoppingBag, HiOutlineLightningBolt, HiOutlineChat, HiOutlineCheck, HiOutlineX as HiOutlineXIcon } from 'react-icons/hi';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import IslamicDivider from '../../components/ui/IslamicDivider';
import { productsAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { Product } from '../../types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { settings } = usePublicSettings();
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsAPI.get(parseInt(id))
      .then(res => setProduct(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-28 max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div className="h-96 bg-dark-800 rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-dark-800 rounded w-3/4" />
            <div className="h-6 bg-dark-800 rounded w-1/4" />
            <div className="h-32 bg-dark-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-28 max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-cream/40 text-xl">المنتج غير موجود</p>
        <Link to="/products" className="gold-btn inline-block mt-4">العودة للمنتجات</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    toast.success('تمت الإضافة إلى السلة');
  };

  const handleBuyNow = () => {
    addItem(product);
    window.location.href = '/checkout';
  };

  const handleChat = () => {
    window.location.href = `/chat?product=${product.id}`;
  };

  return (
    <div>
      <section className="relative pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-cream/40 mb-6">
            <Link to="/" className="hover:text-gold">الرئيسية</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-gold">المنتجات</Link>
            <span>/</span>
            <span className="text-gold">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              <Swiper
                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : undefined }}
                modules={[Thumbs, FreeMode]}
                className="rounded-xl overflow-hidden gold-border"
              >
                {product.images?.map((img, i) => (
                  <SwiperSlide key={i}>
                    <div className="h-96 md:h-[500px]">
                      <img src={img.image_url} alt={`${product.name} - ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {product.images && product.images.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  freeMode
                  watchSlidesProgress
                  className="mt-3"
                >
                  {product.images.map((img, i) => (
                    <SwiperSlide key={i} className="cursor-pointer">
                      <div className="h-20 gold-border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-start gap-2 mb-2">
                {product.is_available ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm"><HiOutlineCheck className="w-4 h-4" /> متوفر</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 text-sm"><HiOutlineXIcon className="w-4 h-4" /> غير متوفر</span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-arabic font-bold text-cream mb-4">{product.name}</h1>

              <div className="gold-text text-3xl font-bold mb-6">
                {product.price.toLocaleString()} <span className="text-lg">د.ج</span>
              </div>

              {product.description && (
                <div className="mb-8">
                  <h3 className="font-arabic text-lg text-gold font-semibold mb-2">الوصف</h3>
                  <p className="text-cream/70 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

              <IslamicDivider />

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={handleAddToCart} disabled={!product.is_available} className="gold-btn flex items-center gap-2 px-8 py-3">
                  <HiOutlineShoppingBag className="w-5 h-5" />
                  أضف إلى السلة
                </button>
                <button onClick={handleBuyNow} disabled={!product.is_available} className="dark-btn flex items-center gap-2 px-8 py-3">
                  <HiOutlineLightningBolt className="w-5 h-5" />
                  اشترِ الآن
                </button>
                <button onClick={handleChat} className="dark-btn flex items-center gap-2 px-6 py-3">
                  <HiOutlineChat className="w-5 h-5" />
                  تحدث مع البائع
                </button>
              </div>

              {settings.whatsapp_number && (
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً، أود الاستفسار عن منتج: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-400 text-sm mt-4 hover:text-green-300 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  استفسر عبر واتساب
                </a>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      <IslamicDivider />
    </div>
  );
}
