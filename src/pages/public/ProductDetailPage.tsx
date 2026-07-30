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
import { Product, ProductVariant } from '../../types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { settings } = usePublicSettings();
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

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

  const displayPrice = selectedVariant?.price ?? product.price;
  const hasVariants = product.variants && product.variants.length > 0;

  const handleAddToCart = () => {
    if (hasVariants && !selectedVariant) {
      toast.error('الرجاء اختيار النوع');
      return;
    }
    addItem(product, 1, selectedVariant);
    toast.success('تمت الإضافة إلى السلة');
  };

  const handleBuyNow = () => {
    if (hasVariants && !selectedVariant) {
      toast.error('الرجاء اختيار النوع');
      return;
    }
    addItem(product, 1, selectedVariant);
    window.location.href = '/checkout';
  };

  const handleChat = () => {
    window.location.href = `/chat?product=${product.id}`;
  };

  const variantImages = hasVariants
    ? product.variants.filter(v => v.image_url).map(v => ({ image_url: v.image_url!, name: v.name }))
    : [];
  const allImages = [...(product.images || []), ...variantImages];
  const selectedVariantImage = selectedVariant?.image_url;

  return (
    <div>
      <section className="relative pt-28 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-cream/40 mb-6">
            <Link to="/" className="hover:text-gold">الرئيسية</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-gold">المنتجات</Link>
            <span>/</span>
            <span className="text-gold">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
              {selectedVariantImage ? (
                <div className="rounded-xl overflow-hidden gold-border h-96 md:h-[500px]">
                  <img src={selectedVariantImage} alt={selectedVariant?.name || ''} className="w-full h-full object-cover" />
                </div>
              ) : (
                <Swiper
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : undefined }}
                  modules={[Thumbs, FreeMode]}
                  className="rounded-xl overflow-hidden gold-border"
                >
                  {(allImages.length > 0 ? allImages : product.images).map((img, i) => (
                    <SwiperSlide key={i}>
                      <div className="h-96 md:h-[500px]">
                        <img src={img.image_url} alt={`${product.name} - ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              {!selectedVariantImage && allImages.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  freeMode
                  watchSlidesProgress
                  className="mt-3"
                >
                  {allImages.map((img, i) => (
                    <SwiperSlide key={i} className="cursor-pointer">
                      <div className="h-20 gold-border rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </motion.div>

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
                {displayPrice.toLocaleString()} <span className="text-lg">د.ج</span>
              </div>

              {hasVariants && (
                <div className="mb-6">
                  <h3 className="font-arabic text-lg text-gold font-semibold mb-3">اختر النوع</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map(v => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(prev => prev?.id === v.id ? null : v)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                          selectedVariant?.id === v.id
                            ? 'border-gold bg-gold/10 text-gold'
                            : 'border-dark-700 bg-dark-800 text-cream/70 hover:border-gold/50'
                        }`}
                      >
                        {v.image_url && (
                          <img src={v.image_url} alt={v.name} className="w-10 h-10 rounded object-cover" />
                        )}
                        <div className="text-right">
                          <p className="text-sm font-semibold">{v.name}</p>
                          {v.price && (
                            <p className="text-xs gold-text">{v.price.toLocaleString()} د.ج</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.description && (
                <div className="mb-8">
                  <h3 className="font-arabic text-lg text-gold font-semibold mb-2">الوصف</h3>
                  <p className="text-cream/70 leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>
              )}

              <IslamicDivider />

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
