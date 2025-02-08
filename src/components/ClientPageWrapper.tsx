'use client';

import dynamic from 'next/dynamic';

const ClientWrapper = dynamic(
  () => import('@/components/ClientWrapper'),
  { ssr: false }
);

export default function ClientPageWrapper({ lang }: { lang: 'de' | 'ar' }) {
  return (
    <div suppressHydrationWarning>
      <ClientWrapper lang={lang} />
    </div>
  );
}