"use client"

import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Menu, X } from 'lucide-react';
import { compress } from '@/lib/compression';
import { ReportData } from '@/types/report';
import { ExamSection, Student, ValidationErrors } from '@/types/grader';
import GraderSidebar from './GraderSidebar';
import GradesGrid from './GradesGrid';
import DarkModeToggle from '../DarkModeToggle';
import { clearLocalStorage, loadFromLocalStorage, saveToLocalStorage } from '@/lib/storage';

const config = {
  // Base path for the application
  // In development, this might be empty
  // In production on GitHub Pages, this would be '/quran'
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/quran',
  
  // Helper function to generate correct URLs for the application
  // This centralizes URL generation logic and makes it easier to modify paths
  generateUrl: (path: string) => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    // Remove any leading slashes from the path to avoid double slashes
    const cleanPath = path.replace(/^\//, '');
    return `${base}/${cleanPath}`;
  }
};

const defaultExamSections: ExamSection[] = [
  {
    name: { de: 'Memorization', ar: 'حفظ' },
    weight: 40
  },
  {
    name: { de: 'Recent Review', ar: 'مراجعة قريبة' },
    weight: 30
  },
  {
    name: { de: 'Past Review', ar: 'مراجعة بعيدة' },
    weight: 20
  },
  {
    name: { de: 'Attendance', ar: 'حضور' },
    weight: 10
  }
];

const translations = {
  de: {
    title: 'Noteneingabe',
    sidebarTitle: 'Klassendaten',
    toggleSidebar: 'Seitenleiste ein-/ausblenden',
    generate: 'Links generieren',
    results: 'Generierte Links',
    validation: {
      weightsSum: 'Die Summe der Gewichtungen muss 100% ergeben',
      requiredField: 'Pflichtfeld',
      invalidGrade: 'Note muss zwischen 1 und 6 liegen'
    },
    reset: 'Alle Daten zurücksetzen',
    resetConfirmation: 'Sind Sie sicher, dass Sie alle Daten zurücksetzen möchten? Dies kann nicht rückgängig gemacht werden.',
  },
  ar: {
    title: 'إدخال الدرجات',
    sidebarTitle: 'بيانات الفصل',
    toggleSidebar: 'إظهار/إخفاء القائمة الجانبية',
    generate: 'توليد الروابط',
    results: 'الروابط المولدة',
    validation: {
      weightsSum: 'مجموع النسب يجب أن يساوي 100%',
      requiredField: 'حقل إجباري',
      invalidGrade: 'الدرجة يجب أن تكون بين 1 و 6'
    },
    reset: 'إعادة تعيين جميع البيانات',
    resetConfirmation: 'هل أنت متأكد أنك تريد إعادة تعيين جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.',
  }
} as const;

interface GraderPageProps {
  lang: 'de' | 'ar';
}

export default function GraderPage({ lang }: GraderPageProps) {
  const validLang = lang === 'de' ? 'de' : 'ar';
  const t = translations[validLang];
  const isRTL = validLang === 'ar';
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [schoolYear, setSchoolYear] = useState(new Date().getFullYear().toString());
  const [classroom, setClassroom] = useState('');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examSections, setExamSections] = useState<ExamSection[]>(defaultExamSections);
  const [students, setStudents] = useState<Student[]>([]);
  const [generatedLinks, setGeneratedLinks] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    const totalWeight = examSections.reduce((sum, section) => sum + section.weight, 0);
    if (totalWeight !== 100) {
      newErrors.weights = t.validation.weightsSum;
    }
    
    if (!schoolYear) newErrors.schoolYear = t.validation.requiredField;
    if (!classroom) newErrors.classroom = t.validation.requiredField;
    if (!examDate) newErrors.examDate = t.validation.requiredField;
    
    students.forEach(student => {
      if (!student.name.trim()) {
        newErrors[`name-${student.id}`] = t.validation.requiredField;
      }

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
    const newErrors = { ...errors };
    Object.keys(newErrors).forEach(key => {
      if ((key.startsWith('name-') || key.startsWith('grade-'))) {
        const studentId = key.split('-')[1];
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
      // Use the configuration helper to generate the correct URL
      return config.generateUrl(`${validLang}/2024-2025-S1?g=${compressed}`);
    });

    setGeneratedLinks(links);
  };

  const SidebarContent = (
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
  );

  // Reset function to clear all data
  const handleReset = () => {
    const confirmReset = window.confirm(
      t.resetConfirmation || 'Are you sure you want to reset all data? This cannot be undone.'
    );
    
    if (confirmReset) {
      clearLocalStorage();
      setSchoolYear(new Date().getFullYear().toString());
      setClassroom('');
      setExamDate(new Date().toISOString().split('T')[0]);
      setExamSections(defaultExamSections);
      setStudents([]);
      setGeneratedLinks([]);
      setErrors({});
    }
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedData = loadFromLocalStorage();
    if (storedData) {
      setSchoolYear(storedData.schoolYear);
      setClassroom(storedData.classroom);
      setExamDate(storedData.examDate);
      setExamSections(storedData.examSections);
      setStudents(storedData.students);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveToLocalStorage({
      schoolYear,
      classroom,
      examDate,
      examSections,
      students
    });
  }, [schoolYear, classroom, examDate, examSections, students]);

  return (
    <div className="min-h-screen bg-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-label={t.toggleSidebar}
              >
                <Menu className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 mx-4">{t.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-md hover:bg-red-50"
              >
                {t.reset || 'Reset All Data'}
              </button>
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu dialog */}
      <Dialog
        as="div"
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        className="relative z-50 lg:hidden"
      >
        {/* Background overlay */}
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        {/* Dialog position */}
        <div className="fixed inset-0 flex">
          <Dialog.Panel
            className={`relative flex-1 flex flex-col w-full max-w-xs bg-white focus:outline-none ${
              isRTL ? 'mr-auto' : 'ml-auto'
            }`}
          >
            {/* Close button */}
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="p-2 rounded-md text-gray-400 hover:text-gray-500"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Sidebar title */}
            <div className="px-6 pt-6 pb-4">
              <Dialog.Title className="text-lg font-semibold">{t.sidebarTitle}</Dialog.Title>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 overflow-y-auto">
              {SidebarContent}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 py-6">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6 bg-white shadow-sm rounded-lg overflow-hidden">
              {SidebarContent}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 space-y-6">
            {/* Grades grid */}
            <div className="bg-white rounded-lg shadow-sm p-6">
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
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              {t.generate}
            </button>

            {/* Generated links section */}
            {generatedLinks.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">{t.results}</h2>
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
    </div>
  );
}