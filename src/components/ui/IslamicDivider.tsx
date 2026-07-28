import { motion } from 'framer-motion';

export default function IslamicDivider() {
  return (
    <div className="islamic-divider">
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3"
      >
        <svg width="200" height="30" viewBox="0 0 200 30" className="text-gold">
          <defs>
            <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#C9A24B" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <line x1="0" y1="15" x2="80" y2="15" stroke="url(#gold-grad)" strokeWidth="1" />
          <circle cx="100" cy="15" r="4" fill="#C9A24B" />
          <path d="M95 10 L100 5 L105 10 L100 8 Z" fill="#C9A24B" />
          <path d="M95 20 L100 25 L105 20 L100 22 Z" fill="#C9A24B" />
          <line x1="120" y1="15" x2="200" y2="15" stroke="url(#gold-grad)" strokeWidth="1" />
        </svg>
      </motion.div>
    </div>
  );
}
