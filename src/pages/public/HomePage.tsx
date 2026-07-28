import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import IslamicDivider from '../../components/ui/IslamicDivider';
import ProductCard from '../../components/public/ProductCard';
import { productsAPI, categoriesAPI, settingsAPI } from '../../services/api';
import { Product, Category } from '../../types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    productsAPI.list({ limit: 8 }).then(res => setProducts(res.data)).catch(() => {});
    categoriesAPI.list().then(res => setCategories(res.data)).catch(() => {});
    settingsAPI.getPublic().then(res => setSettings(res.data)).catch(() => {});
  }, []);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600',
      title: 'أثاث فاخر لمنزلك',
      subtitle: 'تشكيلة واسعة من أجود أنواع الأثاث',
    },
    {
      image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1600',
      title: 'تصاميم عصرية وأنيقة',
      subtitle: 'أحدث صيحات الأثاث العصري',
    },
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[70vh] min-h-[500px]">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          className="h-full"
        >
          {heroSlides.map((slide, i) => (
            <SwiperSlide key={i}>
              <div className="relative h-full">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/50 to-transparent" />
                <div className="absolute bottom-20 right-0 left-0 text-center max-w-3xl mx-auto px-4">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-6xl font-arabic font-bold gold-text mb-4 text-shadow-gold"
                  >
                    {slide.title}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-lg md:text-xl text-cream/80 mb-8"
                  >
                    {slide.subtitle}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex justify-center gap-4"
                  >
                    <Link to="/products" className="gold-btn text-lg px-8 py-3">
                      تسوق الآن
                    </Link>
                    <Link to="/page/about" className="dark-btn text-lg px-8 py-3">
                      من نحن
                    </Link>
                  </motion.div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="section-title">تصنيفاتنا</h2>
          <IslamicDivider />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Link to={`/products?category=${cat.id}`} className="card group block h-64 relative overflow-hidden">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600'}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/30 to-transparent" />
                <div className="absolute bottom-0 right-0 left-0 p-6">
                  <h3 className="font-arabic text-2xl font-bold gold-text mb-1">{cat.name}</h3>
                  {cat.description && <p className="text-cream/60 text-sm">{cat.description}</p>}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <IslamicDivider />

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="section-title">أبرز المنتجات</h2>
          <IslamicDivider />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <motion.div className="text-center mt-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Link to="/products" className="gold-btn inline-flex items-center gap-2 px-8 py-3">
            عرض جميع المنتجات
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      <IslamicDivider />

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=1600" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-dark/80" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-arabic font-bold gold-text mb-6"
          >
            استعد لتجديد منزلك
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-cream/70 mb-8"
          >
            تصفح مجموعتنا المميزة من الأثاث الفاخر واختر ما يناسب ذوقك
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link to="/products" className="gold-btn text-lg px-10 py-4">
              تسوق الآن
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
