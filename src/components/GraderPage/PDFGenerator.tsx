'use client';

import { Download } from "lucide-react";
import { useEffect, useState } from 'react';
import { ReportData } from '@/types/report';

// Define types for html2pdf.js library
interface Html2PdfOptions {
  margin: number;
  filename: string;
  image: {
    type: string;
  };
  html2canvas: {
    scale: number;
    useCORS: boolean;
    backgroundColor: string;
  };
  jsPDF: {
    unit: string;
    format: string;
    orientation: 'portrait' | 'landscape';
  };
}

// Define the worker interface
interface Html2PdfWorker {
  from(element: HTMLElement): Html2PdfWorker;
  set(options: Html2PdfOptions): Html2PdfWorker;
  save(): Promise<void>;
}

// Define the main html2pdf function type
type Html2PdfFunction = {
  (): Html2PdfWorker;
  Worker?: new () => Html2PdfWorker;
};

interface PDFGeneratorProps {
  reportData: ReportData;
  buttonText: string;
}

export default function PDFGenerator({ reportData, buttonText }: PDFGeneratorProps) {
  // Use the proper type for html2pdf
  const [html2pdf, setHtml2pdf] = useState<Html2PdfFunction | null>(null);

  useEffect(() => {
    // Import html2pdf.js and set it with proper typing
    import('html2pdf.js').then((module) => {
      setHtml2pdf(() => module.default as Html2PdfFunction);
    });
  }, []);

  const handleDownload = async () => {
    if (!html2pdf) return;

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

    // Options are now properly typed
    const opt: Html2PdfOptions = {
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
        orientation: 'portrait'
      }
    };

    try {
      const worker = html2pdf().from(element as HTMLElement).set(opt);
      await worker.save();
    } catch (error) {
      console.error('PDF generation error:', error);
      // You might want to show a user-friendly error message here
      // For example, using a toast notification or alert
    }
  };

  return (
    <button 
      onClick={handleDownload} 
      className="bg-green-600 text-white px-2 py-1 text-sm rounded-md hover:bg-green-700 flex items-center gap-1 shadow-md"
      // Add aria-label for accessibility
      aria-label={buttonText}
    >
      <Download size={16} />
      <span>{buttonText}</span>
    </button>
  );
}