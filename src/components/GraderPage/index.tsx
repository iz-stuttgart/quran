'use client';

import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { compress } from '@/lib/compression';
import { ReportData } from '@/types/report';
import { ExamSection, Student, ValidationErrors } from '@/types/grader';
import GraderSidebar from './GraderSidebar';
import GradesGrid from './GradesGrid';
import DarkModeToggle from '../DarkModeToggle';

// Default exam sections that match the structure from defaultData
const defaultExamSections: ExamSection[] = [
  {
    name: {
      de: 'Memorization',
      ar: 'حفظ'
    },
    weight: 40
  },
  {
    name: {
      de: 'Recent Review',
      ar: 'مراجعة قريبة'
    },
    weight: 30
  },
  {
    name: {
      de: 'Past Review',
      ar: 'مراجعة بعيدة'
    },
    weight: 20
  },
  {
    name: {
      de: 'Attendance',
      ar: 'حضور'
    },
    weight: 10
  }
];

// UI text translations
const translations = {
  de: {
    title: 'Noteneingabe',
    toggleSidebar: 'Seitenleiste ein-/ausblenden',
    generate: 'Links generieren',
    results: 'Generierte Links',
    validation: {
      weightsSum: 'Die Summe der Gewichtungen muss 100% ergeben',
      requiredField: 'Pflichtfeld',
      invalidGrade: 'Note muss zwischen 1 und 6 liegen'
    }
  },
  ar: {
    title: 'إدخال الدرجات',
    toggleSidebar: 'إظهار/إخفاء القائمة الجانبية',
    generate: 'توليد الروابط',
    results: 'الروابط المولدة',
    validation: {
      weightsSum: 'مجموع النسب يجب أن يساوي 100%',
      requiredField: 'حقل إجباري',
      invalidGrade: 'الدرجة يجب أن تكون بين 1 و 6'
    }
  }
} as const;

interface GraderPageProps {
  lang: 'de' | 'ar';
}

export default function GraderPage({ lang }: GraderPageProps) {
  // Safety check for lang prop with default to 'de'
  const validLang = lang === 'de' ? 'de' : 'ar';
  const t = translations[validLang];
  const isRTL = validLang === 'ar';
  
  // State for sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Form state with meaningful defaults
  const [schoolYear, setSchoolYear] = useState(new Date().getFullYear().toString());
  const [classroom, setClassroom] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examSections, setExamSections] = useState<ExamSection[]>(defaultExamSections);
  const [students, setStudents] = useState<Student[]>([]);
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([]);
  
  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Handlers for form submission and validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Validate weights sum to 100%
    const totalWeight = examSections.reduce((sum, section) => sum + section.weight, 0);
    if (totalWeight !== 100) {
      newErrors.weights = t.validation.weightsSum;
    }
    
    // Validate required fields
    if (!schoolYear) newErrors.schoolYear = t.validation.requiredField;
    if (!classroom) newErrors.classroom = t.validation.requiredField;
    if (!examDate) newErrors.examDate = t.validation.requiredField;
    
    // Validate student names and grades
    students.forEach(student => {
      // Validate student name
      if (!student.name.trim()) {
        newErrors[`name-${student.id}`] = t.validation.requiredField;
      }

      // Validate grades
      examSections.forEach(section => {
        const grade = student.grades[section.name.de];
        if (grade === undefined) {
          newErrors[`grade-${student.id}-${section.name.de}`] = t.validation.requiredField;
        } else if (grade < 1 || grade > 6) {
          newErrors[`grade-${student.id}-${section.name.de}`] = t.validation.invalidGrade;
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStudentsChange = (newStudents: Student[]) => {
    // Clean up errors for removed students
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      // Check if the error key belongs to a student (starts with 'name-' or 'grade-')
      if ((key.startsWith('name-') || key.startsWith('grade-'))) {
        // Extract student ID from the error key
        const studentId = key.split('-')[1];
        // If the student no longer exists, remove their errors
        if (!newStudents.some(s => s.id === studentId)) {
          delete newErrors[key];
        }
      }
    });
    
    setErrors(newErrors);
    setStudents(newStudents);
  };

  const generateReportLinks = () => {
    if (!validateForm()) return;

    const links = students.map(student => {
      const reportData: ReportData = {
        schoolYear,
        studentName: student.name,
        classroom,
        gender: student.gender,
        examSections: examSections.map(section => ({
          ...section,
          grade: student.grades[section.name.de]
        })),
        date: examDate,
        notes: student.notes
      };

      const compressed = compress(reportData);
      return `/${validLang}?g=${compressed}`;
    });

    setGeneratedLinks(links);
  };

  return (
    <div className="min-h-screen bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Mobile controls group - now includes dark mode toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50 flex items-center gap-4">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-white rounded-md shadow-md"
          aria-label={t.toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="p-2 bg-white rounded-md shadow-md">
          <DarkModeToggle />
        </div>
      </div>

      {/* Desktop dark mode toggle */}
      <div className="hidden lg:block fixed top-4 right-4 z-50 p-2 bg-white rounded-md shadow-md">
        <DarkModeToggle />
      </div>

      {/* Main layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:static lg:translate-x-0
            w-80 h-screen bg-white shadow-lg
            transition-transform duration-300 ease-in-out
            overflow-y-auto z-40
          `}
        >
          <GraderSidebar 
            lang={validLang}
            schoolYear={schoolYear}
            classroom={classroom}
            examDate={examDate}
            examSections={examSections}
            errors={errors}
            onSchoolYearChange={setSchoolYear}
            onClassroomChange={setClassroom}
            onExamDateChange={setExamDate}
            onExamSectionsChange={setExamSections}
          />
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">{t.title}</h1>
          
          {/* Grades grid */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <GradesGrid
              lang={validLang}
              examSections={examSections}
              students={students}
              errors={errors}
              onStudentsChange={handleStudentsChange}
            />
          </div>

          {/* Generate button */}
          <button
            onClick={generateReportLinks}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            {t.generate}
          </button>

          {/* Generated links section */}
          {generatedLinks.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">{t.results}</h2>
              <ul className="space-y-2">
                {generatedLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {students[index].name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}