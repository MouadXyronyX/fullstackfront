import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX, HiOutlinePhone } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { usePublicSettings } from '../../hooks/usePublicSettings';
import { pagesAPI } from '../../services/api';
import { Page } from '../../types';

export default function Header() {
  const { settings } = usePublicSettings();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [extraPages, setExtraPages] = useState<Page[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    pagesAPI.listPublished().then(res => setExtraPages(res.data)).catch(() => {});
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'الرئيسية', path: '/' },
    { label: 'المنتجات', path: '/products' },
    ...extraPages.map(p => ({ label: p.title, path: `/page/${p.slug}` })),
    { label: 'تواصل معنا', path: '/chat' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${location.pathname === '/' || scrolled ? 'bg-dark/95 backdrop-blur-md shadow-card' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt={settings.store_name} className="w-12 h-12 rounded-full object-cover gold-border" />
            <div className="hidden sm:block">
              <h1 className="font-arabic text-xl gold-text font-bold leading-tight">{settings.store_name}</h1>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-arabic transition-all duration-200 ${
                  isActive(link.path)
                    ? 'text-gold bg-gold/10'
                    : 'text-cream/80 hover:text-gold hover:bg-gold/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link to="/track-order" className="hidden sm:flex items-center gap-1 text-cream/60 hover:text-gold text-sm transition-colors">
              <HiOutlinePhone className="w-4 h-4" />
              تتبع طلبي
            </Link>

            <Link to="/checkout" className="relative p-2 text-cream/80 hover:text-gold transition-colors">
              <HiOutlineShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-dark text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="p-2 text-cream/80 hover:text-gold transition-colors">
                  <HiOutlineUser className="w-6 h-6" />
                </button>
                <div className="absolute left-0 top-full mt-2 w-48 bg-dark-800 gold-border rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-3 border-b border-dark-700">
                    <p className="font-arabic text-sm text-gold">{user?.name}</p>
                  </div>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-cream/80 hover:text-gold hover:bg-dark-700">حسابي</Link>
                  <Link to="/chat" className="block px-4 py-2 text-sm text-cream/80 hover:text-gold hover:bg-dark-700">المحادثات</Link>
                  <button onClick={logout} className="w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-dark-700 rounded-b-xl">تسجيل خروج</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden sm:block gold-btn text-sm py-2 px-4">تسجيل الدخول</Link>
            )}

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-cream/80 hover:text-gold">
              {mobileMenuOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-dark-900/95 backdrop-blur-md border-t border-dark-700"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-arabic ${
                    isActive(link.path) ? 'text-gold bg-gold/10' : 'text-cream/80'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block gold-btn text-center mt-2">
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
