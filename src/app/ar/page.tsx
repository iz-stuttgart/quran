import { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { decompress } from '@/lib/compression'; // Move compression functions to a separate file
import { defaultData } from '@/lib/defaults'; // Move default data to a separate file

export const metadata: Metadata = {
  title: 'التقرير السنوي',
  description: 'صفحة التقرير السنوي باللغة العربية'
};

export default function ArabicHome({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const gParam = searchParams.g;
  const compressedData = typeof gParam === 'string' ? gParam : undefined;
  
  const reportData = compressedData
    ? decompress(compressedData) || defaultData
    : defaultData;

  return <HomePage lang="ar" reportData={reportData} />;
}