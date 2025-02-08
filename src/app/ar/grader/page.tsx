// src/app/[lang]/grader/page.tsx
import { Metadata } from 'next';
import GraderPage from '@/components/GraderPage';
import { translations } from '@/types/grader';

// Define supported languages type
type SupportedLang = 'de' | 'ar';

type Props = {
  params: Promise<{ lang: SupportedLang }>;
};

// Metadata generation
export async function generateMetadata({ 
  params 
}: Props): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: translations.titles[lang],
    description: translations.descriptions[lang],
  };
}

// Page component
export default async function Grader({ 
  params 
}: Props) {
  const { lang } = await params;
  return <GraderPage lang={lang} />;
}