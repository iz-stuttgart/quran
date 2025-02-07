interface MultilingualText {
  de: string;
  ar: string;
}

interface ExamSection {
  name: MultilingualText;
  weight: number;
  grade?: number;
}

export interface ReportData {
  schoolYear: string;
  studentName?: string;
  classroom?: string;
  gender: 'f' | 'm';
  examSections: ExamSection[];
  notes?: string;
  date: string;
}