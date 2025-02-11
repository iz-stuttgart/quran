import { ExamSection, GradedExamSection } from "@/types/grader";
import { ReportData } from "@/types/report";

export const defaultExamSections: ExamSection[] = [
  {
    name: {
      de: 'Arabisch',
      ar: 'لغة عربية'
    },
    weight: 40
  },
  {
    name: {
      de: 'Quran',
      ar: 'قرآن'
    },
    weight: 35
  },
  {
    name: {
      de: 'Islamkunde',
      ar: 'تربية إسلامية'
    },
    weight: 25
  }
];

const gradedExamSections: GradedExamSection[] = defaultExamSections.map(section => {
  
  const getRandomGrade = () => {
    const possibleSteps = [0, 0.3, 0.5, 0.7];
    const baseGrades = [1, 2, 3];
    
    const baseGrade = baseGrades[Math.floor(Math.random() * baseGrades.length)];
    const step = possibleSteps[Math.floor(Math.random() * possibleSteps.length)];
    
    return Math.min(3, baseGrade + step);
  };

  return {
    ...section,
    grade: getRandomGrade()
  };
});

export const defaultData: ReportData = {
  schoolYear: "2024-2025",
  studentName: "أحمد محمد",
  classroom: "الفوج السادس",
  gender: 'm',
  examSections: gradedExamSections,
  date: new Date().toISOString().split('T')[0],
  notes: "طالب متميز ومجتهد"
};