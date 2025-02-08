'use client';

import Image from "next/image";
import Link from "next/link";
import { Download,Printer } from "lucide-react";
import pako from 'pako';
import { useMemo } from 'react';
import { ReportData } from '@/types/report';
import { defaultData } from "@/lib/defaults";
import html2pdf from 'html2pdf.js';
import { GradedExamSection } from "@/types/grader";

// Translations now only include UI elements, not section names
const translations = {
  de: {
    title: 'Jahresergebnis',
    studentName: {
      m: 'Name des Schülers',
      f: 'Name der Schülerin'
    },
    group: 'Gruppe',
    evaluationTitle: 'Bewertungskriterien',
    studentGrade: 'Note',
    percentage: 'Gewichtung',
    totalGrade: 'Gesamtnote',
    notes: 'Anmerkungen',
    date: 'Datum',
    switchLang: 'العربية',
    download: 'Als PDF herunterladen',
    print: 'Drucken'
  },
  ar: {
    title: 'النتيجة السنوية',
    studentName: {
      m: 'اسم الطالب',
      f: 'اسم الطالبة'
    },
    group: 'الحلقة',
    evaluationTitle: 'فرع التقيييم',
    studentGrade: 'العلامة',
    percentage: 'النسبة',
    totalGrade: 'المجموع النهائي',
    notes: 'ملاحظات',
    date: 'التاريخ',
    switchLang: 'Deutsch',
    download: 'تحميل كملف PDF',
    print: 'طباعة'
  }
} as const;

const handleDownload = (reportData: ReportData) => {
  // Use a class name without square brackets
  const element = document.querySelector('.report-container');
  
  if (!element) return;

  const formatFileName = () => {
    const className = reportData.classroom?.trim() || 'no-class';
    const studentName = reportData.studentName?.trim() || 'unnamed';
    
    const sanitizeForFileName = (str: string) => {
      return str
        .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
    };

    const currentDate = new Date().toISOString().split('T')[0];
    return `report_${sanitizeForFileName(className)}_${sanitizeForFileName(studentName)}_${currentDate}.pdf`;
  };

  const opt = {
    margin: 0.5,
    filename: formatFileName(),
    image: {
      type: 'jpeg',
      quality: 1
    },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: {
      unit: 'in',
      format: 'a5',
      orientation: 'portrait' as const
    }
  };

  html2pdf().set(opt).from(element as HTMLElement).save();
};

function formatDate(dateStr: string, lang: 'de' | 'ar'): string {
  const date = new Date(dateStr);
  
  // Common options for both calendars
  const fullOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long' as const,
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const
  };

  // Options without weekday for secondary date
  const dateOnlyOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric' as const,
    month: 'long' as const,
    day: 'numeric' as const
  };

  if (lang === 'de') {
    // German formatting
    const gregorianFormatter = new Intl.DateTimeFormat('de-DE', fullOptions);
    const gregorianParts = gregorianFormatter.formatToParts(date);
    let gregorianDate = '';

    // Secondary (Hijri) date without weekday
    const hijriFormatter = new Intl.DateTimeFormat('de-DE-u-ca-islamic-umalqura', dateOnlyOptions);
    const hijriParts = hijriFormatter.formatToParts(date);
    let hijriDate = '';

    gregorianParts.forEach(part => {
      if (part.type === 'weekday') gregorianDate += part.value + ', ';
      else if (part.type === 'day') gregorianDate += part.value + '. ';
      else if (part.type === 'month') gregorianDate += part.value + ' ';
      else if (part.type === 'year') gregorianDate += part.value;
    });

    hijriParts.forEach(part => {
      if (part.type === 'day') hijriDate += part.value + '. ';
      else if (part.type === 'month') hijriDate += part.value + ' ';
      else if (part.type === 'year') hijriDate += part.value;
    });

    return `${gregorianDate} (${hijriDate} AH)`;
  } else {
    // Arabic formatting
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', fullOptions);
    const hijriParts = hijriFormatter.formatToParts(date);
    let hijriDate = '';

    const gregorianFormatter = new Intl.DateTimeFormat('ar', dateOnlyOptions);
    const gregorianParts = gregorianFormatter.formatToParts(date);
    let gregorianDate = '';

    hijriParts.forEach(part => {
      if (part.type === 'weekday') hijriDate += part.value + '، ';
      else if (['day', 'month', 'year'].includes(part.type)) hijriDate += part.value + ' ';
      else if (part.type === 'literal' && part.value !== '، ') hijriDate += part.value;
    });
    hijriDate = hijriDate.trim() + ' هـ';

    gregorianParts.forEach(part => {
      if (['day', 'month', 'year'].includes(part.type)) gregorianDate += part.value + ' ';
      else if (part.type === 'literal' && part.value !== '، ') gregorianDate += part.value;
    });
    gregorianDate = gregorianDate.trim() + ' م';

    return `${hijriDate} الموافق ${gregorianDate}`;
  }
}

function compress(data: ReportData): string {
  try {
    // Step 1: Convert the data object to a JSON string
    const jsonString = JSON.stringify(data);

    // Step 2: Convert the string to a Uint8Array using TextEncoder
    const textEncoder = new TextEncoder();
    const bytes = textEncoder.encode(jsonString);

    // Step 3: Compress the bytes using pako
    const compressed = pako.deflate(bytes);

    // Step 4: Convert the compressed bytes to a binary string
    let binaryString = '';
    for (let i = 0; i < compressed.length; i++) {
      binaryString += String.fromCharCode(compressed[i]);
    }

    // Step 5: Convert to base64
    const base64 = btoa(binaryString);

    // Step 6: Make the base64 URL-safe by replacing characters
    // Replace '+' with '-' and '/' with '_'
    // Remove padding '=' characters at the end
    const urlSafe = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Step 7: URL encode the result to handle special characters
    return encodeURIComponent(urlSafe);
  } catch (error) {
    console.error('Compression error:', error);
    throw error;  // Re-throw the error to be handled by the caller
  }
}

function calculateTotalGrade(examSections: GradedExamSection[]): number | null {
  const validGrades = examSections.every(section =>
    typeof section.grade === 'number' &&
    section.grade >= 1 &&
    section.grade <= 6
  );

  if (!validGrades) return null;

  const totalWeight = examSections.reduce((sum, section) => sum + section.weight, 0);
  if (totalWeight !== 100) return null;

  const weightedSum = examSections.reduce((sum, section) =>
    sum + (section.grade! * section.weight), 0);

  return Number((weightedSum / 100).toFixed(1));
}

interface HomePageProps {
  lang: 'de' | 'ar';
  reportData: ReportData;
}

export default function HomePage({ lang, reportData }: HomePageProps) {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  const textDir = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'text-right' : 'text-left';

  const totalGrade = calculateTotalGrade(reportData.examSections);

  const formattedDate = useMemo(() =>
    formatDate(reportData.date, lang),
    [reportData.date, lang]
  );

  const handlePrint = () => {
    window.print();
  };

  const urlParameter = useMemo(() => {
    try {
      // Only compress if we're not using default data
      const isDefaultData = reportData === defaultData;
      if (isDefaultData) {
        return '';
      }
      return `?g=${compress(reportData)}`;
    } catch (error) {
      console.error('Error compressing data for URL:', error);
      return '';
    }
  }, [reportData]);

  const switchLanguageHref = useMemo(() => {
    const newLang = lang === 'de' ? 'ar' : 'de';
    return `/${newLang}${urlParameter}`;
  }, [lang, urlParameter]);

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 print:p-0 print:bg-white">
      {/* Top controls container - Everything here won't be printed */}
      <div className="fixed top-4 w-full flex justify-between items-center print:hidden">
        {/* Left side - Print and Download buttons */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 shadow-md"
          >
            <Printer size={20} />
            <span>{t.print}</span>
          </button>
          
          <button
            onClick={() => handleDownload(reportData)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2 shadow-md"
          >
            <Download size={20} />
            <span>{t.download}</span>
          </button>
        </div>
  
        {/* Right side - Language switcher */}
        <Link
          href={switchLanguageHref}
          className="mr-4 rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
        >
          {t.switchLang}
        </Link>
      </div>
  
      {/* Report Container - This is what gets printed */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none report-container">
        <div className="w-full p-6" dir={textDir}>
          {/* Rest of the report content */}
          <div className="flex justify-between items-center mb-6">
            <Image
              src="/institute-logo.png"
              alt="Institute Logo"
              width={70}
              height={70}
              className="object-contain"
            />
            <h1 className={`text-2xl font-bold ${textAlign}`}>
              {t.title} {reportData.schoolYear}
            </h1>
            <Image
              src="/quran-logo.png"
              alt="Quran Logo"
              width={70}
              height={70}
              className="object-contain"
            />
          </div>
  
          {/* Student Information */}
          <div className="space-y-4 mb-6">
            <div className="flex border-b border-gray-300 pb-2">
              <span className="w-1/3 font-bold text-gray-700">
                {t.studentName[reportData.gender]}:
              </span>
              <span className="w-2/3 border-b border-dashed border-gray-400">
                {reportData.studentName || ''}
              </span>
            </div>
            <div className="flex border-b border-gray-300 pb-2">
              <span className="w-1/3 font-bold text-gray-700">{t.group}:</span>
              <span className="w-2/3 border-b border-dashed border-gray-400">
                {reportData.classroom || ''}
              </span>
            </div>
          </div>

          {/* Evaluation Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className={`p-2 border border-gray-300 ${textAlign}`}>{t.evaluationTitle}</th>
                  <th className={`p-2 border border-gray-300 ${textAlign} w-24`}>{t.percentage}</th>
                  <th className={`p-2 border border-gray-300 ${textAlign} w-24`}>{t.studentGrade}</th>
                </tr>
              </thead>
              <tbody>
                {/* Exam sections - now using multilingual names */}
                {reportData.examSections.map((section, index) => (
                  <tr key={index}>
                    <td className="p-2 border border-gray-300">
                      {section.name[lang]}
                    </td>
                    <td className="p-2 border border-gray-300 text-center">{section.weight}%</td>
                    <td className="p-2 border border-gray-300 text-center">
                      {section.grade?.toFixed(1) || ''}
                    </td>
                  </tr>
                ))}

                {/* Total grade row */}
                <tr className="font-bold bg-gray-50">
                  <td colSpan={2} className="p-2 border border-gray-300">
                    {t.totalGrade}
                  </td>
                  <td className="p-2 border border-gray-300 text-center">
                    {totalGrade?.toFixed(1) || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <p className="font-bold text-gray-700 mb-2">{t.notes}:</p>
            <div className="border-b border-dashed border-gray-400 h-16">
              {reportData.notes || ''}
            </div>
          </div>

          {/* Date Section */}
          <div className={`${textAlign}`}>
            <p className="font-bold text-gray-700 mb-1">{t.date}:</p>
            <p>{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}