import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineHome, HiOutlineCube, HiOutlineCollection, HiOutlineShoppingBag, HiOutlineUsers, HiOutlineDocumentText, HiOutlineChat, HiOutlineCog, HiOutlineLogout, HiOutlineBell, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const ADMIN_PREFIX = 'portal-x9k2';

const sidebarItems = [
  { label: 'لوحة التحكم', path: `/${ADMIN_PREFIX}`, icon: HiOutlineHome },
  { label: 'المنتجات', path: `/${ADMIN_PREFIX}/products`, icon: HiOutlineCube },
  { label: 'التصنيفات', path: `/${ADMIN_PREFIX}/categories`, icon: HiOutlineCollection },
  { label: 'الطلبات', path: `/${ADMIN_PREFIX}/orders`, icon: HiOutlineShoppingBag },
  { label: 'الحسابات', path: `/${ADMIN_PREFIX}/users`, icon: HiOutlineUsers },
  { label: 'الصفحات', path: `/${ADMIN_PREFIX}/pages`, icon: HiOutlineDocumentText },
  { label: 'المحادثات', path: `/${ADMIN_PREFIX}/chats`, icon: HiOutlineChat },
  { label: 'الإعدادات', path: `/${ADMIN_PREFIX}/settings`, icon: HiOutlineCog },
];

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { unreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // If on login page, show only the login form
  if (location.pathname === `/${ADMIN_PREFIX}/login`) {
    return <Outlet />;
  }

  // Protect admin routes
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to={`/${ADMIN_PREFIX}/login`} replace />;
  }

  const handleLogout = () => {
    logout();
    navigate(`/${ADMIN_PREFIX}/login`);
  };

  const isActive = (path: string) => {
    if (path === `/${ADMIN_PREFIX}`) return location.pathname === `/${ADMIN_PREFIX}`;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 0 }}
        className="fixed lg:sticky top-0 right-0 h-screen z-50 bg-dark-900 border-l border-dark-700 overflow-hidden"
      >
        <div className="w-[260px] h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-dark-700 flex items-center justify-between">
            <Link to={`/${ADMIN_PREFIX}`} className="flex items-center gap-2">
              <img src="/logo.png" alt="اثاث القدس" className="w-8 h-8 rounded-full object-cover gold-border" />
              <span className="font-arabic text-gold font-bold text-sm">لوحة التحكم</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-cream/60 hover:text-gold">
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Nav */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {sidebarItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gold/10 text-gold font-medium'
                    : 'text-cream/60 hover:text-gold hover:bg-gold/5'
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
                {item.label === 'الطلبات' && unreadCount > 0 && (
                  <span className="mr-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-dark-700 space-y-2">
            <div className="px-3 py-2 text-xs text-cream/40">
              {user?.name}
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors">
              <HiOutlineLogout className="w-5 h-5" />
              <span>تسجيل خروج</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 bg-dark/95 backdrop-blur-md border-b border-dark-700 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-cream/60 hover:text-gold">
            <HiOutlineMenu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-xs text-cream/40 hover:text-gold transition-colors">العودة للموقع</Link>
            <div className="relative">
              <HiOutlineBell className="w-5 h-5 text-cream/60" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
