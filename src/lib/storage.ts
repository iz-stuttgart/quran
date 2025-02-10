import { ExamSection, Student } from '@/types/grader';

interface StoredGraderData {
  schoolYear: string;
  classroom: string;
  examDate: string;
  examSections: ExamSection[];
  students: Student[];
}

const STORAGE_KEY = 'grader_data';

export const saveToLocalStorage = (data: StoredGraderData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (): StoredGraderData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const clearLocalStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
};