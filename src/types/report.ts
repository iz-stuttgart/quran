import { GradedExamSection } from "./grader";

export interface ReportData {
  schoolYear: string;
  studentName?: string;
  classroom?: string;
  gender: 'f' | 'm';
  examSections: GradedExamSection[];
  notes?: string;
  date: string;
}