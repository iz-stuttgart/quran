// components/CertificateRenderer.tsx
import React from 'react';
import CertificatePage from './CertificatePage';
import type { ReportData } from '@/types/report';

interface CertificateRendererProps {
  lang: 'de' | 'ar';
  reportData: ReportData;
}

export default function CertificateRenderer({ lang, reportData }: CertificateRendererProps) {
  return <CertificatePage lang={lang} reportData={reportData} />;
}