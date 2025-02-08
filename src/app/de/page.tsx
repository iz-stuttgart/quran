import { Metadata } from 'next';
import ClientPageWrapper from '@/components/ClientPageWrapper';

export const metadata: Metadata = {
  title: 'Jahresergebnis',
  description: 'Jahresergebnis Berichtsseite'
};

export default function GermanHome() {
  return <ClientPageWrapper lang="de" />;
}