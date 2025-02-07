// src/app/[lang]/grader/page.tsx
import { Metadata } from 'next';
import GraderPage from '@/components/GraderPage';
import { translations } from '@/types/grader';

// Dynamic metadata based on language
export async function generateMetadata({
  params: { lang }
}: {
  params: { lang: string }
}): Promise<Metadata> {
  return {
    title: translations.titles['de'],
    description: translations.descriptions['de'],
  };
}

interface GraderProps {
  params: {
    lang: 'de' | 'ar'
  }
}

export default function Grader({ params }: GraderProps) {
  return <GraderPage lang='de' />;
}