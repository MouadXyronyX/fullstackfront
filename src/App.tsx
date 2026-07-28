import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import HomePage from './pages/public/HomePage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import CheckoutPage from './pages/public/CheckoutPage';
import TrackOrderPage from './pages/public/TrackOrderPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ProfilePage from './pages/public/ProfilePage';
import ChatPage from './pages/public/ChatPage';
import DynamicPage from './pages/public/DynamicPage';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPages from './pages/admin/AdminPages';
import AdminChats from './pages/admin/AdminChats';
import AdminSettings from './pages/admin/AdminSettings';

const ADMIN_PREFIX = 'portal-x9k2';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="track-order" element={<TrackOrderPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="chat/:chatId" element={<ChatPage />} />
        <Route path="page/:slug" element={<DynamicPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path={`/${ADMIN_PREFIX}`} element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="pages" element={<AdminPages />} />
        <Route path="chats" element={<AdminChats />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
