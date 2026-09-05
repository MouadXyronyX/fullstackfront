import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

interface PublicSettings {
  store_name: string;
  store_description: string;
  facebook_url: string;
  instagram_url: string;
  whatsapp_number: string;
  phone: string;
  email: string;
  address: string;
  working_hours: string;
}

// Persist settings cache in sessionStorage so it survives page refresh
const SESSION_KEY = 'public_settings_cache';

function loadFromSessionStorage(): PublicSettings | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

let cached: PublicSettings | null = loadFromSessionStorage();
let fetchPromise: Promise<void> | null = null;

const defaults: PublicSettings = {
  store_name: 'اثاث القدس',
  store_description: 'متجر الأثاث الفاخر في الجزائر. نوفر لكم أفضل قطعة الأثاث العصرية والكلاسيكية بأجود الخامات وأفضل الأسعار.',
  facebook_url: 'https://facebook.com/alqudsfurniture',
  instagram_url: 'https://instagram.com/alqudsfurniture',
  whatsapp_number: '213555000000',
  phone: '0555 00 00 00',
  email: 'contact@alquds-store.com',
  address: 'الجزائر العاصمة، الجزائر',
  working_hours: 'السبت - الخميس: 9:00 - 20:00',
};

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings>(cached || defaults);
  const [loading, setLoading] = useState(!cached);

  useEffect(() => {
    if (cached) {
      setSettings(cached);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = settingsAPI.getPublic()
        .then(res => {
          const merged = { ...defaults };
          for (const key of Object.keys(merged)) {
            if (res.data[key]) {
              (merged as any)[key] = res.data[key];
            }
          }
          cached = merged;
          try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(merged)); } catch {}
          setSettings(cached);
        })
        .catch(() => {
          cached = defaults;
          setSettings(cached);
        })
        .finally(() => {
          fetchPromise = null;
          setLoading(false);
        });
    } else {
      fetchPromise.then(() => {
        setSettings(cached || defaults);
        setLoading(false);
      });
    }
  }, []);

  return { settings, loading };
}
