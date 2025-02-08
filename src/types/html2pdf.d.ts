declare module 'html2pdf.js' {
    interface Html2PdfOptions {
      margin?: number | [number, number, number, number];
      filename?: string;
      image?: { type?: string; quality?: number };
      html2canvas?: {
        scale?: number;
        useCORS?: boolean;
        letterRendering?: boolean;
      };
      jsPDF?: {
        unit?: string;
        format?: string;
        orientation?: 'portrait' | 'landscape';
      };
      pagebreak?: {
        mode?: string[];
        before?: string[];
        after?: string[];
        avoid?: string[];
      };
    }
  
    interface Html2PdfInstance {
      from(element: HTMLElement | string): Html2PdfInstance;
      set(options: Html2PdfOptions): Html2PdfInstance;
      save(): Promise<void>;
      outputPdf(): Promise<Blob>;
      outputImg(): Promise<Blob>;
    }
  
    interface Html2PdfStatic {
      (element?: HTMLElement | string, options?: Html2PdfOptions): Html2PdfInstance;
    }
  
    const html2pdf: Html2PdfStatic;
    export default html2pdf;
  }