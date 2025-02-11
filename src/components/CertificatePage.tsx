'use client';

import Image from "next/image";
import Link from "next/link";
import { Download,Printer } from "lucide-react";
import pako from 'pako';
import { useMemo } from 'react';
import { ReportData } from '@/types/report';
import { defaultData } from "@/lib/defaults";
import html2pdf from 'html2pdf.js';
import WeightedGradesTable from "@/components/WeightedGradesTable";

const translations = {
  de: {
    title: 'Noten des ersten Semesters Zertifikat',
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
    title: 'شهادة درجات الفصل الدراسي الأول',
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

const handleDownload = async (reportData: ReportData) => {
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

  const fileName = formatFileName();

  // Basic options focusing on essential settings
  const opt = {
    margin: 10,
    filename: fileName,
    image: { type: 'jpeg' },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: {
      unit: 'mm',
      format: 'a5',
      orientation: 'portrait' as 'portrait' | 'landscape'
    }
  };

  try {
    // Create and save PDF
    const worker = html2pdf().from(element as HTMLElement).set(opt);
    await worker.save();
  } catch (error) {
    console.error('PDF generation error:', error);
  }
};

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

interface CertificatePageProps {
  lang: 'de' | 'ar';
  reportData: ReportData;
}

export default function CertificatePage({ lang, reportData }: CertificatePageProps) {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  const textDir = isRTL ? 'rtl' : 'ltr';
  const textAlign = isRTL ? 'text-right' : 'text-left';

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
    return `/${newLang}/2024-2025-S1/${urlParameter}`;
  }, [lang, urlParameter]);

  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 py-4 px-2 print:p-0 print:bg-white">
      {/* Controls */}
      <div className="fixed top-2 w-full flex justify-between items-center print:hidden">
        <div className="flex gap-1 ml-2">
          <button onClick={handlePrint} className="bg-blue-600 text-white px-2 py-1 text-sm rounded-md hover:bg-blue-700 flex items-center gap-1 shadow-md">
            <Printer size={16} />
            <span>{t.print}</span>
          </button>
          <button onClick={() => handleDownload(reportData)} className="bg-green-600 text-white px-2 py-1 text-sm rounded-md hover:bg-green-700 flex items-center gap-1 shadow-md">
            <Download size={16} />
            <span>{t.download}</span>
          </button>
        </div>
        <Link href={switchLanguageHref} className="mr-2 rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50">
          {t.switchLang}
        </Link>
      </div>
  
      {/* Report Container - Optimized for A5 */}
      <div className="max-w-[148mm] mx-auto bg-white shadow-lg print:shadow-none rounded-lg report-container">
        {/* Top green header */}
        <div className="h-8 bg-gradient-to-r from-green-600 to-green-800 rounded-t-lg print:rounded-none" />
        
        <div className="w-full p-4" dir={textDir}>
          {/* Header section with logos and info */}
          <div className="flex items-start gap-4 mb-6">
            {/* Student information - always comes first in DOM order */}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-center text-green-900 mb-4">
                {t.title}
                <br/>
                {reportData.schoolYear}
              </h1>

              <div className="space-y-3">
                {/* Student Name - Using flex with minimal gap */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 min-w-fit">
                    {t.studentName[reportData.gender || 'm']}:
                  </span>
                  <span className="text-base font-medium text-green-900 ms-2">
                    {reportData.studentName || ''}
                  </span>
                </div>

                {/* Classroom - Using flex with minimal gap */}
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 min-w-fit">
                    {t.group}:
                  </span>
                  <span className="text-base font-medium text-green-900 ms-2">
                    {reportData.classroom || ''}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Logo container */}
            <div className="w-32 h-32 flex-shrink-0">
              <Image 
                src={`${base}/institute-logo.png`} 
                alt="Institute Logo" 
                width={128}
                height={128}
                className="w-full h-full object-contain" 
              />
            </div>
          </div>
  
          {/* Rest of the component remains the same */}
          <div className="mb-4">
            <WeightedGradesTable 
              examSections={reportData.examSections}
              lang={lang}
            />
          </div>
  
          <div className="mb-4 bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold text-gray-700 mb-1 text-sm">{t.notes}:</p>
            <div className="min-h-8 bg-white p-2 rounded border border-gray-200 text-sm">
              {reportData.notes || ''}
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-8 mb-4 ${textAlign}`}>
            <div className="flex flex-col">
              <div className="h-16 border-b border-gray-300"></div>
              <p className="mt-1 text-sm text-gray-600">
                {lang === 'de' ? 'Unterschrift der Lehrkraft' : 'توقيع المعلم'}
              </p>
            </div>

            <div className="flex flex-col">
              <div className="h-16 border-b border-gray-300"></div>
              <p className="mt-1 text-sm text-gray-600">
                {lang === 'de' ? 'Unterschrift der Eltern' : 'توقيع ولي الأمر'}
              </p>
            </div>
          </div>
        </div>

        <div className="h-8 bg-gradient-to-r from-green-600 to-green-800 rounded-b-lg print:rounded-none" />
      </div>
    </div>
  );
}