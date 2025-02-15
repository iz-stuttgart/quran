'use client';

import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { generateBatchPDF } from '@/lib/pdfGeneration';
import type { ReportData } from '@/types/report';

interface BatchPDFGeneratorProps {
  students: Array<{
    name: string;
    data: ReportData;
  }>;
  lang: 'de' | 'ar';
  buttonText: string;
}

export default function BatchPDFGenerator({ students, lang, buttonText }: BatchPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBatchDownload = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      await generateBatchPDF(students, lang);
    } catch (error) {
      console.error('Error generating batch PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleBatchDownload}
      disabled={isGenerating}
      className={`
        px-4 py-2 rounded-md flex items-center gap-2 shadow-md
        ${isGenerating 
          ? 'bg-purple-400 cursor-not-allowed' 
          : 'bg-purple-600 hover:bg-purple-700'
        }
        text-white
      `}
    >
      <Download size={20} />
      <span>
        {isGenerating ? 'Generating PDFs... Please wait' : buttonText}
      </span>
    </button>
  );
}