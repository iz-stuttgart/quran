import React, { useState } from 'react';
import { Plus, X, User, Mail } from 'lucide-react';
import { ExamSection } from '@/types/grader';

const translations = {
  de: {
    addStudent: 'Schüler hinzufügen',
    studentName: 'Name des Schülers',
    gender: 'Geschlecht',
    male: 'männlich',
    female: 'weiblich',
    notes: 'Anmerkungen',
    notesPlaceholder: 'Optionale Anmerkungen zum Schüler...',
    removeStudent: 'Schüler entfernen',
    grade: 'Note',
    validation: {
      required: 'Pflichtfeld',
      invalidGrade: 'Note muss zwischen 1 und 6 liegen'
    },
    filters: {
      all: 'Alle',
      incomplete: 'Unvollständig',
      complete: 'Vollständig'
    },
    search: 'Schüler suchen...',
    noResults: 'Keine Schüler gefunden',
    total: 'Gesamtnote'
  },
  ar: {
    addStudent: 'إضافة طالب',
    studentName: 'اسم الطالب',
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    notes: 'ملاحظات',
    notesPlaceholder: 'ملاحظات اختيارية حول الطالب...',
    removeStudent: 'حذف الطالب',
    grade: 'الدرجة',
    validation: {
      required: 'حقل مطلوب',
      invalidGrade: 'الدرجة يجب أن تكون بين 1 و 6'
    },
    filters: {
      all: 'الكل',
      incomplete: 'غير مكتمل',
      complete: 'مكتمل'
    },
    search: 'البحث عن طالب...',
    noResults: 'لم يتم العثور على طلاب',
    total: 'المجموع'
  }
} as const;

interface Student {
  id: string;
  name: string;
  gender: 'f' | 'm';
  grades: Record<string, number | undefined>;
  notes?: string;
}

interface GradesGridProps {
  lang: 'de' | 'ar';
  examSections: ExamSection[];
  students: Student[];
  errors: Record<string, string>;
  onStudentsChange: (students: Student[]) => void;
  onErrorsChange?: (errors: Record<string, string>) => void;
}

export default function GradesGrid({
  lang,
  examSections,
  students,
  errors,
  onStudentsChange,
  onErrorsChange
}: GradesGridProps) {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Validation function for checking if a grade is valid
  const isValidGrade = (grade: number | undefined): boolean => {
    if (grade === undefined) return false;
    return grade >= 1 && grade <= 6 && !isNaN(grade);
  };

  // Calculate if a student has all valid grades
  const isStudentComplete = (student: Student): boolean => {
    if (!student || !student.name) return false;
    return (
      student.name.trim().length > 0 &&
      examSections.every(section => isValidGrade(student.grades[section.name.de]))
    );
  };

  // Calculate total grade for a student
  const calculateTotalGrade = (student: Student): number | null => {
    if (!student || !isStudentComplete(student)) return null;

    const weightedSum = examSections.reduce((sum, section) => {
      const grade = student.grades[section.name.de];
      return sum + ((grade as number) * section.weight);
    }, 0);

    return Number((weightedSum / 100).toFixed(1));
  };

  // Filter and search students
  const filteredStudents = students.filter(student => {
    if (!student) return false;
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'complete' && isStudentComplete(student)) ||
      (filter === 'incomplete' && !isStudentComplete(student));

    const matchesSearch = 
      student.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Handle adding a new student
  const handleAddStudent = () => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: '',
      gender: 'm',
      grades: {}
    };
    onStudentsChange([...students, newStudent]);
  };

  // Handle removing a student
  const handleRemoveStudent = (studentId: string) => {
    // Clean up errors related to this student
    if (onErrorsChange) {
      const newErrors = { ...errors };
      Object.keys(newErrors).forEach(key => {
        if (key.includes(studentId)) {
          delete newErrors[key];
        }
      });
      onErrorsChange(newErrors);
    }
    
    // Remove the student
    onStudentsChange(students.filter(s => s.id !== studentId));
  };

  // Handle student data changes
  const handleStudentChange = (studentId: string, field: keyof Student, value: any) => {
    onStudentsChange(students.map(student => 
      student?.id === studentId
        ? { ...student, [field]: value }
        : student
    ));
  };

  // Handle grade changes
  const handleGradeChange = (studentId: string, sectionName: string, value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    
    // Validate grade format immediately
    const isValidFormat = !value || (!isNaN(Number(value)) && value.length <= 3);
    if (!isValidFormat) return;

    onStudentsChange(students.map(student =>
      student?.id === studentId
        ? {
            ...student,
            grades: {
              ...student.grades,
              [sectionName]: numValue
            }
          }
        : student
    ));
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
          />
          <User className="absolute top-2.5 left-3 text-gray-400" />
        </div>

        <div className="flex gap-2">
          {(['all', 'incomplete', 'complete'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-md ${
                filter === filterOption
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t.filters[filterOption]}
            </button>
          ))}
        </div>

        <button
          onClick={handleAddStudent}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          {t.addStudent}
        </button>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => student && (
          <div
            key={student.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden border ${
              isStudentComplete(student) ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Student Header */}
            <div className="p-4 bg-gray-50 flex justify-between items-start">
              <div className="flex-1">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={student.name}
                    onChange={(e) => handleStudentChange(student.id, 'name', e.target.value)}
                    placeholder={t.studentName}
                    className={`w-full text-lg font-medium bg-transparent border-b 
                      ${errors[`name-${student.id}`]
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-transparent hover:border-gray-300 focus:border-blue-500'}
                      focus:outline-none`}
                  />
                  {errors[`name-${student.id}`] && (
                    <p className="text-sm text-red-500">{errors[`name-${student.id}`]}</p>
                  )}
                </div>

                <div className="mt-2 flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={student.gender === 'm'}
                      onChange={() => handleStudentChange(student.id, 'gender', 'm')}
                      className="mr-2"
                    />
                    {t.male}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={student.gender === 'f'}
                      onChange={() => handleStudentChange(student.id, 'gender', 'f')}
                      className="mr-2"
                    />
                    {t.female}
                  </label>
                </div>
              </div>
              
              <button
                onClick={() => handleRemoveStudent(student.id)}
                className="text-gray-400 hover:text-red-500"
                aria-label={t.removeStudent}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grades Section */}
            <div className="p-4 space-y-4">
              {examSections.map(section => (
                <div key={section.name.de} className="space-y-1">
                  <div className="flex items-center gap-4">
                    <label className="flex-1 text-sm font-medium">
                      {section.name[lang]}
                      <span className="text-gray-500 text-xs"> ({section.weight}%)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="6"
                      step="0.1"
                      value={student.grades[section.name.de] || ''}
                      onChange={(e) => handleGradeChange(student.id, section.name.de, e.target.value)}
                      className={`w-20 p-2 border rounded-md ${
                        errors[`grade-${student.id}-${section.name.de}`]
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors[`grade-${student.id}-${section.name.de}`] && (
                    <p className="text-sm text-red-500">
                      {errors[`grade-${student.id}-${section.name.de}`]}
                    </p>
                  )}
                </div>
              ))}

              {/* Total Grade */}
              <div className="flex items-center gap-4 pt-2 border-t">
                <span className="flex-1 font-medium">{t.total}</span>
                <span className="w-20 p-2 text-center font-bold">
                  {calculateTotalGrade(student)?.toFixed(1) || '-'}
                </span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="p-4 bg-gray-50 border-t">
              <textarea
                value={student.notes || ''}
                onChange={(e) => handleStudentChange(student.id, 'notes', e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>{t.noResults}</p>
        </div>
      )}
    </div>
  );
}