import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineSearch, HiOutlineAdjustments, HiOutlineX } from 'react-icons/hi';
import IslamicDivider from '../../components/ui/IslamicDivider';
import ProductCard from '../../components/public/ProductCard';
import { productsAPI, categoriesAPI } from '../../services/api';
import { Product, Category } from '../../types';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category_id: searchParams.get('category') || '',
    min_price: '',
    max_price: '',
    is_available: '',
  });

  useEffect(() => {
    categoriesAPI.list().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = {};
    if (filters.search) params.search = filters.search;
    if (filters.category_id) params.category_id = parseInt(filters.category_id);
    if (filters.min_price) params.min_price = parseFloat(filters.min_price);
    if (filters.max_price) params.max_price = parseFloat(filters.max_price);
    if (filters.is_available) params.is_available = filters.is_available === 'true';

    productsAPI.list(params).then(res => {
      setProducts(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category_id) params.set('category', newFilters.category_id);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ search: '', category_id: '', min_price: '', max_price: '', is_available: '' });
    setSearchParams({});
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div>
      {/* Page Header */}
      <section className="relative pt-28 pb-12">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=1600" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-dark/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-arabic font-bold gold-text mb-4">المنتجات</h1>
          <IslamicDivider />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input-field pr-12"
            />
          </div>
          <button onClick={() => setFiltersOpen(!filtersOpen)} className="dark-btn flex items-center gap-2 justify-center">
            <HiOutlineAdjustments className="w-5 h-5" />
            فلترة
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="text-red-400 text-sm flex items-center gap-1 hover:text-red-300">
              <HiOutlineX className="w-4 h-4" />
              مسح الفلترة
            </button>
          )}
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-dark-800 rounded-xl p-6 mb-8 gold-border"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-cream/60 mb-2 font-arabic">التصنيف</label>
                <select
                  value={filters.category_id}
                  onChange={(e) => handleFilterChange('category_id', e.target.value)}
                  className="input-field"
                >
                  <option value="">الكل</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-cream/60 mb-2 font-arabic">أقل سعر</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-cream/60 mb-2 font-arabic">أعلى سعر</label>
                <input
                  type="number"
                  placeholder="999999"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-cream/60 mb-2 font-arabic">التوفر</label>
                <select
                  value={filters.is_available}
                  onChange={(e) => handleFilterChange('is_available', e.target.value)}
                  className="input-field"
                >
                  <option value="">الكل</option>
                  <option value="true">متوفر</option>
                  <option value="false">غير متوفر</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="card h-80 animate-pulse">
                <div className="h-56 bg-dark-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-dark-700 rounded w-3/4" />
                  <div className="h-4 bg-dark-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-cream/40 text-xl font-arabic">لا توجد منتجات مطابقة للبحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
