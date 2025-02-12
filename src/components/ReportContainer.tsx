'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CertificatePage from '@/components/CertificatePage';
import { decompress } from '@/lib/compression';
import { defaultData } from '@/lib/defaults';

function ReportContent({ lang }: { lang: 'ar' | 'de' }) {
  const searchParams = useSearchParams();
  const gParam = searchParams.get('g');
  
  // Only decompress on the client side
  const reportData = typeof window !== 'undefined' && gParam
    ? decompress(gParam) || defaultData
    : defaultData;

  return <CertificatePage lang={lang} reportData={reportData} />;
}

export default function ReportContainer({ lang }: { lang: 'ar' | 'de' }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReportContent lang={lang} />
    </Suspense>
  );
}