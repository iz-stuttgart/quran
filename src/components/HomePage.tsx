'use client';

import Image from "next/image";
import Link from "next/link";

// Define translations for both languages in a type-safe way
// Using a const assertion to get exact string literal types
const translations = {
  de: {
    title: 'Erste Schritte durch Bearbeiten von',
    save: 'Speichern und siehe die Änderungen sofort.',
    deploy: 'Jetzt bereitstellen',
    docs: 'Dokumentation lesen',
    learn: 'Lernen',
    examples: 'Beispiele',
    nextjs: 'Zu nextjs.org gehen →',
    switchLang: 'العربية' // Arabic text for language switcher
  },
  ar: {
    title: 'ابدأ بتحرير',
    save: 'احفظ وشاهد التغييرات على الفور.',
    deploy: 'النشر الآن',
    docs: 'قراءة المستندات',
    learn: 'تعلم',
    examples: 'أمثلة',
    nextjs: 'انتقل إلى nextjs.org ←', // Note the reversed arrow for RTL
    switchLang: 'Deutsch' // German text for language switcher
  }
} as const;

// Define the component's props interface for type safety
interface HomePageProps {
  lang: 'de' | 'ar';
}

export default function HomePage({ lang }: HomePageProps) {
  // Get the translations for the current language
  const t = translations[lang];
  
  // Determine if we should use RTL layout
  const isRTL = lang === 'ar';
  
  // Determine the link for language switching
  const alternateLink = lang === 'de' ? '/ar' : '/de';

  return (
    <div 
      // Set the text direction based on language
      dir={isRTL ? 'rtl' : 'ltr'} 
      className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]"
    >
      {/* Language switcher - positioned absolutely in the top-right corner */}
      <Link 
        href={alternateLink}
        className="absolute top-4 right-4 rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-1 text-sm bg-transparent hover:bg-black/[.05] dark:hover:bg-white/[.06]"
      >
        {t.switchLang}
      </Link>

      {/* Main content area */}
      <main className={`flex flex-col gap-8 row-start-2 items-center ${isRTL ? 'sm:items-end' : 'sm:items-start'}`}>
        {/* Next.js Logo */}
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />

        {/* Instructions list */}
        <ol className={`list-inside list-decimal text-sm text-center ${isRTL ? 'sm:text-right' : 'sm:text-left'} font-[family-name:var(--font-geist-mono)]`}>
          <li className="mb-2">
            {t.title}{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/page.tsx
            </code>
          </li>
          <li>{t.save}</li>
        </ol>

        {/* Action buttons */}
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          {/* Deploy button */}
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={20}
              height={20}
            />
            {t.deploy}
          </a>

          {/* Documentation button */}
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.docs}
          </a>
        </div>
      </main>

      {/* Footer with additional links */}
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* Learn link */}
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          {t.learn}
        </a>

        {/* Examples link */}
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          {t.examples}
        </a>

        {/* Next.js link */}
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          {t.nextjs}
        </a>
      </footer>
    </div>
  );
}