import { ReportData } from "@/types/report";

export const defaultData: ReportData = {
  schoolYear: "2024-2025",
  studentName: "أحمد محمد",
  classroom: "الفوج السادس",
  gender: 'm',
  examSections: [
    {
      name: {
        de: 'Arabisch',
        ar: 'لغة عربية'
      },
      weight: 40,
      grade: 1.5
    },
    {
      name: {
        de: 'Quran',
        ar: 'قرآن'
      },
      weight: 35,
      grade: 1
    },
    {
      name: {
        de: 'Islamkunde',
        ar: 'تربية إسلامية'
      },
      weight: 25,
      grade: 2
    }
  ],
  date: new Date().toISOString().split('T')[0],
  notes: "طالب متميز ومجتهد"
};