'use client';

import { useEffect, useState } from 'react';
import CertificatePage from '@/components/CertificatePage';
import { defaultData } from '@/lib/defaults';

export default function ClientWrapper({ lang }: { lang: 'ar' | 'de' }) {
  const [reportData, setReportData] = useState(defaultData);

  useEffect(() => {
    // Only run in browser
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const gParam = params.get('g');
      
      if (gParam) {
        // Dynamically import compression utilities only on client side
        import('@/lib/compression').then(({ decompress }) => {
          const decompressedData = decompress(gParam);
          if (decompressedData) {
            setReportData(decompressedData);
          }
        }).catch(console.error);
      }
    }
  }, []);

  return <CertificatePage lang={lang} reportData={reportData} />;
}