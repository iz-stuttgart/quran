'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export function useLanguage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get current language from URL, default to German
  const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'de';
  
  // Function to change language
  const setLanguage = (newLang: 'de' | 'ar') => {
    router.push(`/?lang=${newLang}`);
  };

  return { lang, setLanguage };
}