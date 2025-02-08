'use client';

import dynamic from 'next/dynamic';

const ClientWrapper = dynamic(
  () => import('@/components/ClientWrapper'),
  { ssr: false }
);

export default function ClientPageWrapper({ lang }: { lang: string }) {
  return (
    <div suppressHydrationWarning>
      <ClientWrapper lang={lang} />
    </div>
  );
}