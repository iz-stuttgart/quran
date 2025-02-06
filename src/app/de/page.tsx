import { Metadata } from 'next';
import HomePage from '@/components/HomePage';
import { decompress } from '@/lib/compression';
import { defaultData } from '@/lib/defaults';

export const metadata: Metadata = {
  title: 'Jahresergebnis',
  description: 'Jahresergebnis Berichtsseite'
};

export default function GermanHome({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const gParam = searchParams.g;
  const compressedData = typeof gParam === 'string' ? gParam : undefined;
  
  const reportData = compressedData
    ? decompress(compressedData) || defaultData
    : defaultData;

  return <HomePage lang="de" reportData={reportData} />;
}