import type { ReportData } from '@/types/report';
import React from 'react';
import type { Root } from 'react-dom/client';

export async function generateBatchPDF(
  students: { name: string; data: ReportData }[],
  lang: 'de' | 'ar'
): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  let root: Root | null = null;

  try {
    const { default: CertificateRenderer } = await import('@/components/CertificateRenderer');
    const { createRoot } = await import('react-dom/client');
    const { jsPDF } = await import('jspdf');
    const { toCanvas } = await import('html-to-image');

    // Create the final PDF document
    const finalPdf = new jsPDF({
      unit: 'mm',
      format: 'a5',
      orientation: 'portrait'
    });

    root = createRoot(container);

    for (let i = 0; i < students.length; i++) {
      const { data } = students[i];

      // Render certificate
      await new Promise<void>((resolve) => {
        root!.render(React.createElement(CertificateRenderer, {
          lang,
          reportData: data
        }));
        setTimeout(resolve, 1000);
      });

      const reportContainer = container.querySelector('.report-container');
      if (!reportContainer) {
        throw new Error('Could not find report container');
      }

      try {
        // Convert the container to canvas at normal scale
        const baseCanvas = await toCanvas(reportContainer as HTMLElement, {
          backgroundColor: '#ffffff'
        });

        // Create a new canvas with doubled dimensions
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = baseCanvas.width * 2;
        scaledCanvas.height = baseCanvas.height * 2;
        
        // Get the context and scale it
        const scaledCtx = scaledCanvas.getContext('2d');
        if (!scaledCtx) {
          throw new Error('Could not get 2d context from scaled canvas');
        }

        // Scale up and draw the original canvas
        scaledCtx.scale(2, 2);
        scaledCtx.drawImage(baseCanvas, 0, 0);

        // Add new page if not first page
        if (i > 0) {
          finalPdf.addPage();
        }

        // Convert scaled canvas to base64 image
        const imgData = scaledCanvas.toDataURL('image/jpeg', 1.0);

        // Add to PDF
        finalPdf.addImage(
          imgData,
          'JPEG',
          0,
          0,
          finalPdf.internal.pageSize.getWidth(),
          finalPdf.internal.pageSize.getHeight(),
          undefined,
          'FAST'
        );

      } catch (error) {
        console.error(`Error processing certificate ${i + 1}:`, error);
        throw error;
      }
    }

    // Save the final combined PDF
    finalPdf.save(`certificates_batch_${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generating batch PDF:', error);
    throw error;
  } finally {
    if (root) {
      root.unmount();
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}