import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import IslamicDivider from '../../components/ui/IslamicDivider';
import { pagesAPI } from '../../services/api';
import { Page } from '../../types';

export default function DynamicPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    pagesAPI.getBySlug(slug)
      .then(res => setPage(res.data))
      .catch(() => setPage(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-28 max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-800 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-dark-800 rounded w-3/4 mx-auto" />
          <div className="h-64 bg-dark-800 rounded" />
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="pt-28 max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-arabic text-cream/60 mb-4">الصفحة غير موجودة</h1>
        <Link to="/" className="gold-btn inline-block">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="pt-28 max-w-4xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-arabic font-bold gold-text text-center">{page.title}</h1>
        <IslamicDivider />
        <div
          className="mt-8 prose prose-invert max-w-none prose-headings:text-gold prose-a:text-gold prose-strong:text-gold"
          dangerouslySetInnerHTML={{ __html: page.content || '' }}
        />
      </motion.div>
    </div>
  );
}
