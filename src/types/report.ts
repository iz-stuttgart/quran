import { GradedExamSection } from "./grader";

export interface AttendanceData {
  attended: number;     // Number of classes attended
  total: number;       // Total number of classes
}

export interface ReportData {
  schoolYear: string;
  studentName?: string;
  classroom?: string;
  gender: 'f' | 'm';
  examSections: GradedExamSection[];
  notes?: string;
  date: string;
  attendance?: AttendanceData;
}