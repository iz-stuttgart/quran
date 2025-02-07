interface MultilingualText {
  de: string;
  ar: string;
}

export interface ExamSection {
  name: MultilingualText;  // Name of the section in both languages
  weight: number;          // Weight as a percentage (1-100)
  grade?: number;         // Optional grade (1-6)
}

export const titles = {
  de: 'Plattform für Testbenotung',
  ar: 'منصة تحصيل درجات الإختبار'
};

export const descriptions = {
  de: 'Plattform für Testbenotung',
  ar: 'منصة تحصيل درجات الإختبار'
};