/**
 * Supported languages in the application
 */
export type Language = 'de' | 'ar';

/**
 * Text that needs to be available in multiple languages
 */
export interface MultilingualText {
  de: string;
  ar: string;
}

/**
 * Static text content used across the application
 */
export const translations = {
  titles: {
    de: 'Plattform für Testbenotung',
    ar: 'منصة تحصيل درجات الإختبار'
  },
  descriptions: {
    de: 'Plattform für Testbenotung',
    ar: 'منصة تحصيل درجات الإختبار'
  }
} as const;

/**
 * Student gender type
 */
export type Gender = 'f' | 'm';

/**
 * Section of an exam with its weight and name in supported languages
 */
export interface ExamSection {
  name: MultilingualText;  // Name of the section in both languages
  weight: number;          // Weight as a percentage (1-100)
}

/**
 * Exam section with an assigned grade
 */
export interface GradedExamSection extends ExamSection {
  grade: number;          // Grade (1-6)
}

/**
 * Student data structure
 */
export interface Student {
  id: string;             // Unique identifier
  name: string;           // Student's full name
  gender: Gender;         // Student's gender
  grades: Record<string, number | undefined>;  // Grades for each section
  notes?: string;         // Optional notes about the student
}

/**
 * Validation errors structure
 * Keys can be:
 * - Simple field names: 'schoolYear', 'classroom', etc.
 * - Student-specific fields: 'name-{studentId}', 'grade-{studentId}-{sectionName}'
 * - Special validation keys: 'weights'
 */
export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Form state for creating/editing a student
 */
export interface StudentFormData {
  name: string;
  gender: Gender;
  notes?: string;
}

/**
 * Filter options for the student list
 */
export type StudentFilter = 'all' | 'complete' | 'incomplete';

/**
 * Props shared between grader components
 */
export interface CommonGraderProps {
  lang: Language;
  errors: ValidationErrors;
}

/**
 * Grade validation constants
 */
export const GRADE_CONSTRAINTS = {
  MIN: 1,
  MAX: 6
} as const;

/**
 * Weight validation constants
 */
export const WEIGHT_CONSTRAINTS = {
  MIN: 0,
  MAX: 100,
  TOTAL: 100
} as const;