import { ReportData } from "@/types/report";

export const defaultData: ReportData = {
  schoolYear: "2024-2025",
  studentName: "أحمد محمد",
  classroom: "الفوج السادس",
  gender: 'm',
  examSections: [
    {
      name: {
        de: 'Memorization',        // First section: Memorization
        ar: 'حفظ'
      },
      weight: 40,                   // Highest weight (40%)
      grade: 1.5
    },
    {
      name: {
        de: 'Recent Review',       // Second section: Recent Review
        ar: 'مراجعة قريبة'
      },
      weight: 30,                   // Second highest weight (30%)
      grade: 1
    },
    {
      name: {
        de: 'Past Review',         // Third section: Past Review
        ar: 'مراجعة بعيدة'
      },
      weight: 20,                   // Third highest weight (20%)
      grade: 3
    },
    {
      name: {
        de: 'Attendance',          // Fourth section: Attendance
        ar: 'حضور'
      },
      weight: 10,                   // Lowest weight (10%)
      grade: 2
    }
  ],
  date: new Date().toISOString().split('T')[0],
  notes: "طالب متميز ومجتهد"
};