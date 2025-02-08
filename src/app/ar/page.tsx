import { Metadata } from 'next';
import ClientPageWrapper from '@/components/ClientPageWrapper';

export const metadata: Metadata = {
  title: 'التقرير السنوي',
  description: 'صفحة التقرير السنوي باللغة العربية'
};

export default function ArabicHome() {
  return <ClientPageWrapper lang="ar" />;
}