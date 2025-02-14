import React, { useState } from 'react';
import { Plus, X, User, Search, Check } from 'lucide-react';
import {
  ExamSection,
  Language,
  Student,
  ValidationErrors,
  StudentFilter,
  GRADE_CONSTRAINTS
} from '@/types/grader';
import { AttendanceData } from '@/types/report';

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
    filters: {
      all: 'Alle',
      incomplete: 'Unvollständig',
      complete: 'Vollständig'
    },
    search: 'Schüler suchen...',
    noResults: 'Keine Schüler gefunden',
    noStudents: 'Noch keine Schüler hinzugefügt',
    addFirstStudent: 'Ersten Schüler hinzufügen',
    total: 'Gesamtnote',
    validation: {
      required: 'Pflichtfeld',
      invalidGrade: 'Note muss zwischen 1 und 6 liegen'
    },
    attendance: {
      label: 'Anwesenheit',
      description: 'Besuchte/Gesamte Unterrichtsstunden'
    }
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
    filters: {
      all: 'الكل',
      incomplete: 'غير مكتمل',
      complete: 'مكتمل'
    },
    search: 'البحث عن طالب...',
    noResults: 'لم يتم العثور على طلاب',
    noStudents: 'لم تتم إضافة طلاب بعد',
    addFirstStudent: 'إضافة أول طالب',
    total: 'المجموع',
    validation: {
      required: 'حقل مطلوب',
      invalidGrade: 'الدرجة يجب أن تكون بين 1 و 6'
    },
    attendance: {
      label: 'الحضور',
      description: 'الحصص المحضورة/إجمالي الحصص'
    }
  }
} as const;

interface GradesGridProps {
  lang: Language;
  examSections: ExamSection[];
  students: Student[];
  errors: ValidationErrors;
  onStudentsChange: (students: Student[]) => void;
}

export default function GradesGrid({
  lang,
  examSections,
  students,
  errors,
  onStudentsChange
}: GradesGridProps) {
  const t = translations[lang];

  const [filter, setFilter] = useState<StudentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStudentChange = (studentId: string, field: keyof Omit<Student, 'grades' | 'attendance'>, value: string) => {
    onStudentsChange(students.map(student =>
      student.id === studentId
        ? { ...student, [field]: value }
        : student
    ));
  };

  const handleAttendanceChange = (studentId: string, field: keyof AttendanceData, value: number) => {
    onStudentsChange(students.map(student =>
      student.id === studentId
        ? {
          ...student,
          attendance: {
            ...student.attendance,
            [field]: value
          }
        }
        : student
    ));
  };

  const isValidGrade = (grade: number | undefined): boolean => {
    if (grade === undefined) return false;
    return grade >= GRADE_CONSTRAINTS.MIN &&
      grade <= GRADE_CONSTRAINTS.MAX &&
      !isNaN(grade);
  };

  const isStudentComplete = (student: Student): boolean => {
    if (!student.name.trim()) return false;
    return examSections.every(section =>
      isValidGrade(student.grades[section.name.de])
    );
  };

  const calculateTotalGrade = (student: Student): number | null => {
    if (!isStudentComplete(student)) return null;

    const weightedSum = examSections.reduce((sum, section) => {
      const grade = student.grades[section.name.de];
      return sum + ((grade as number) * section.weight);
    }, 0);

    return Number((weightedSum / 100).toFixed(1));
  };

  const filteredStudents = students.filter(student => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'complete' && isStudentComplete(student)) ||
      (filter === 'incomplete' && !isStudentComplete(student));

    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: '',
      gender: 'm',
      grades: {},
      notes: '',
      attendance: {
        attended: 0,
        total: 0
      }
    };
    onStudentsChange([...students, newStudent]);
  };

  const handleRemoveStudent = (studentId: string) => {
    onStudentsChange(students.filter(s => s.id !== studentId));
  };

  const handleGradeChange = (studentId: string, sectionName: string, value: string) => {
    const numValue = value === '' ? undefined : Number(value);

    const isValidFormat = !value || (!isNaN(Number(value)) && value.length <= 3);
    if (!isValidFormat) return;

    onStudentsChange(students.map(student =>
      student.id === studentId
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

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          {t.noStudents}
        </h3>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleAddStudent}
            className="inline-flex items-center px-4 py-2 border border-transparent 
                     shadow-sm text-sm font-medium rounded-md text-white 
                     bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
            {t.addFirstStudent}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-md border-gray-300 pl-10 
                     focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'incomplete', 'complete'] as const).map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`
                inline-flex items-center px-3 py-2 rounded-md text-sm font-medium
                ${filter === filterOption
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {filter === filterOption && (
                <Check className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {t.filters[filterOption]}
            </button>
          ))}
        </div>

        {/* Add Student Button */}
        <button
          type="button"
          onClick={handleAddStudent}
          className="inline-flex items-center px-4 py-2 border border-transparent 
                   shadow-sm text-sm font-medium rounded-md text-white 
                   bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                   focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
          {t.addStudent}
        </button>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div
            key={student.id}
            className={`
              bg-white rounded-lg shadow-sm border overflow-hidden
              ${isStudentComplete(student) ? 'border-green-200' : 'border-gray-200'}
            `}
          >
            {/* Student Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <input
                      type="text"
                      value={student.name}
                      onChange={(e) => handleStudentChange(student.id, 'name', e.target.value)}
                      placeholder={t.studentName}
                      className={`
                        w-full bg-transparent text-lg font-medium
                        border-b focus:border-blue-500 focus:ring-0
                        ${errors[`name-${student.id}`] ? 'border-red-300' : 'border-transparent'}
                      `}
                    />
                    {errors[`name-${student.id}`] && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors[`name-${student.id}`]}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={student.gender === 'm'}
                        onChange={() => handleStudentChange(student.id, 'gender', 'm')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t.male}</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={student.gender === 'f'}
                        onChange={() => handleStudentChange(student.id, 'gender', 'f')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t.female}</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveStudent(student.id)}
                  className="text-gray-400 hover:text-red-500 focus:outline-none"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Grades Section */}
            <div className="p-4 space-y-4">
              {examSections.map(section => (
                <div key={section.name.de}>
                  <div className="flex items-center justify-between gap-4">
                    <label className="block text-sm font-medium text-gray-700">
                      {section.name[lang]}
                      <span className="text-gray-500 text-xs ml-1">
                        ({section.weight}%)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min={GRADE_CONSTRAINTS.MIN}
                        max={GRADE_CONSTRAINTS.MAX}
                        step="0.1"
                        value={student.grades[section.name.de] || ''}
                        onChange={(e) => handleGradeChange(student.id, section.name.de, e.target.value)}
                        className={`
                          w-20 rounded-md shadow-sm text-right
                          ${errors[`grade-${student.id}-${section.name.de}`]
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                          }
                        `}
                      />
                      {errors[`grade-${student.id}-${section.name.de}`] && (
                        <p className="absolute right-0 mt-1 text-sm text-red-600">
                          {errors[`grade-${student.id}-${section.name.de}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Grade */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-sm font-medium text-gray-900">
                  {t.total}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {calculateTotalGrade(student)?.toFixed(1) || '-'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600">{t.attendance.label}:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  value={student.attendance?.attended || ''}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    handleAttendanceChange(student.id, 'attended', newValue);
                  }}
                  className="w-16 rounded-md border-gray-300 text-center"
                />
                <span className="text-gray-500">/</span>
                <input
                  type="number"
                  min="1"
                  value={student.attendance?.total || ''}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value) || 0;
                    handleAttendanceChange(student.id, 'total', newValue);
                  }}
                  className="w-16 rounded-md border-gray-300 text-center"
                />
              </div>
            </div>

            {/* Notes Section */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.notes}
              </label>
              <textarea
                value={student.notes}
                onChange={(e) => handleStudentChange(student.id, 'notes', e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={2}
                className="w-full rounded-md border-gray-300 
                         focus:border-blue-500 focus:ring-blue-500
                         resize-none text-sm"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && students.length > 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Search className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t.noResults}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? 'Try adjusting your search or filter criteria.'
              : 'Try changing your filter selection.'}
          </p>
        </div>
      )}
    </div>
  );
}