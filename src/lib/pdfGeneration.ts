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
  let baseCanvas: HTMLCanvasElement | null = null;
  let scaledCanvas: HTMLCanvasElement | null = null;

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

    // Get PDF dimensions and set margins
    const pdfWidth = finalPdf.internal.pageSize.getWidth();
    const pdfHeight = finalPdf.internal.pageSize.getHeight();
    const margin = 5;
    const availableWidth = pdfWidth - (2 * margin);
    const availableHeight = pdfHeight - (2 * margin);

    root = createRoot(container);

    for (let i = 0; i < students.length; i++) {
      const { data } = students[i];

      // Clean up previous canvases to free memory
      if (baseCanvas) {
        baseCanvas.width = 0;
        baseCanvas.height = 0;
        baseCanvas = null;
      }
      if (scaledCanvas) {
        scaledCanvas.width = 0;
        scaledCanvas.height = 0;
        scaledCanvas = null;
      }

      // Render certificate
      await new Promise<void>((resolve) => {
        root!.render(React.createElement(CertificateRenderer, {
          lang,
          reportData: data
        }));
        // Reduced timeout since we're using less intensive processing
        setTimeout(resolve, 500);
      });

      const reportContainer = container.querySelector('.report-container');
      if (!reportContainer) {
        throw new Error('Could not find report container');
      }

      try {
        // Convert the container to canvas with moderate scaling
        baseCanvas = await toCanvas(reportContainer as HTMLElement, {
          backgroundColor: '#ffffff',
          pixelRatio: 2 // Reduced from 3 to 2 for better performance
        });

        // Create a new canvas with doubled dimensions
        scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = baseCanvas.width * 2;
        scaledCanvas.height = baseCanvas.height * 2;
        
        const scaledCtx = scaledCanvas.getContext('2d');
        if (!scaledCtx) {
          throw new Error('Could not get 2d context from scaled canvas');
        }

        // Basic image smoothing
        scaledCtx.imageSmoothingEnabled = true;
        scaledCtx.scale(2, 2);
        scaledCtx.drawImage(baseCanvas, 0, 0);

        // Add new page if not first page
        if (i > 0) {
          finalPdf.addPage();
        }

        // Use JPEG with high quality for better performance
        const imgData = scaledCanvas.toDataURL('image/jpeg', 0.95);

        // Calculate dimensions
        const ratio = Math.min(availableWidth / scaledCanvas.width, availableHeight / scaledCanvas.height);
        const finalWidth = scaledCanvas.width * ratio;
        const finalHeight = scaledCanvas.height * ratio;
        
        // Center the image
        const xOffset = margin + (availableWidth - finalWidth) / 2;
        const yOffset = margin + (availableHeight - finalHeight) / 2;

        // Add to PDF
        finalPdf.addImage(
          imgData,
          'JPEG',
          xOffset,
          yOffset,
          finalWidth,
          finalHeight,
          undefined,
          'FAST'
        );

      } catch (error) {
        console.error(`Error processing certificate ${i + 1}:`, error);
        throw error;
      }
    }

    // Save the final PDF
    finalPdf.save(`certificates_batch_${new Date().toISOString().split('T')[0]}.pdf`);

  } catch (error) {
    console.error('Error generating batch PDF:', error);
    throw error;
  } finally {
    // Clean up resources
    if (root) {
      root.unmount();
    }
    if (baseCanvas) {
      baseCanvas.width = 0;
      baseCanvas.height = 0;
    }
    if (scaledCanvas) {
      scaledCanvas.width = 0;
      scaledCanvas.height = 0;
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}