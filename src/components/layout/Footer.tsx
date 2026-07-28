import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';
import { FaFacebook, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import IslamicDivider from '../ui/IslamicDivider';
import { usePublicSettings } from '../../hooks/usePublicSettings';

export default function Footer() {
  const { settings } = usePublicSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900 border-t border-dark-700">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <IslamicDivider />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {/* About */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt={settings.store_name} className="w-10 h-10 rounded-full object-cover gold-border" />
              <div>
                <h3 className="font-arabic text-lg gold-text font-bold">{settings.store_name}</h3>
              </div>
            </div>
            <p className="text-cream/60 text-sm leading-relaxed">
              {settings.store_description}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <h3 className="font-arabic text-lg text-gold font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              {[
                { label: 'الرئيسية', path: '/' },
                { label: 'المنتجات', path: '/products' },
                { label: 'تتبع طلبي', path: '/track-order' },
                { label: 'من نحن', path: '/page/about' },
                { label: 'سياسة الاستبدال', path: '/page/return-policy' },
              ].map(link => (
                <li key={link.path}>
                  <Link to={link.path} className="text-cream/60 hover:text-gold text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <h3 className="font-arabic text-lg text-gold font-bold mb-4">اتصل بنا</h3>
            <ul className="space-y-3">
              {settings.phone && (
                <li className="flex items-center gap-2 text-cream/60 text-sm">
                  <HiOutlinePhone className="w-4 h-4 text-gold flex-shrink-0" />
                  <span dir="ltr">{settings.phone}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2 text-cream/60 text-sm">
                  <HiOutlineMail className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>{settings.email}</span>
                </li>
              )}
              {settings.address && (
                <li className="flex items-center gap-2 text-cream/60 text-sm">
                  <HiOutlineLocationMarker className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.working_hours && (
                <li className="flex items-center gap-2 text-cream/60 text-sm">
                  <HiOutlineClock className="w-4 h-4 text-gold flex-shrink-0" />
                  <span>{settings.working_hours}</span>
                </li>
              )}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <h3 className="font-arabic text-lg text-gold font-bold mb-4">تابعنا</h3>
            <div className="flex gap-3">
              {settings.facebook_url && (
                <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 gold-border rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-all duration-300">
                  <FaFacebook className="w-5 h-5" />
                </a>
              )}
              {settings.instagram_url && (
                <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 gold-border rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-all duration-300">
                  <FaInstagram className="w-5 h-5" />
                </a>
              )}
              {settings.whatsapp_number && (
                <a href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 gold-border rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-dark transition-all duration-300">
                  <FaWhatsapp className="w-5 h-5" />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        <div className="border-t border-dark-700 mt-8 pt-6 text-center">
          <p className="text-cream/40 text-sm">
            © {currentYear} <span className="text-gold">{settings.store_name}</span> — جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </footer>
  );
}
