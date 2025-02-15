import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Dialog } from '@headlessui/react';
import { ExamSection, Student } from '@/types/grader';

interface FileImportProps {
  onXlsxImport: (sections: ExamSection[], students: Student[]) => void;
  onCsvImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  translations: {
    importCsv: string;
    importXlsx: string;
    selectDateRange?: string;
    startDate?: string;
    endDate?: string;
    confirm?: string;
    cancel?: string;
  };
}

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string) => void;
  translations: {
    title?: string;
    startDate?: string;
    endDate?: string;
    confirm?: string;
    cancel?: string;
  };
}

type WorksheetRow = (string | number | null | undefined)[];
type WorksheetData = WorksheetRow[];

interface AttendanceCount {
  attended: number;
  total: number;
}

interface ExamData {
  sections: string[];
  scores: number[];
  attendance?: AttendanceCount;
}

const DateRangeModal: React.FC<DateRangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  translations
}) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">
            {translations.title || 'Select Attendance Date Range'}
          </Dialog.Title>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.startDate || 'Start Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {translations.endDate || 'End Date'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
            >
              {translations.cancel || 'Cancel'}
            </button>
            <button
              onClick={() => onConfirm(startDate, endDate)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              disabled={!startDate || !endDate}
            >
              {translations.confirm || 'Confirm'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const parseDate = (dateStr: string): Date | null => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try DD-MM-YY format
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(`20${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return null;
    }
    return date;
  } catch {
    return null;
  }
};

const countAttendance = (
  worksheet: XLSX.WorkSheet,
  startDate: Date,
  endDate: Date
): AttendanceCount => {
  const data = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
  let attended = 0;
  let total = 0;

  data.forEach((row) => {
    if (!row[0] || !row[1]) return;
    
    const dateStr = String(row[0]).trim();
    if (!dateStr || !/\d/.test(dateStr)) return;

    const date = parseDate(dateStr);
    if (!date) return;

    if (date >= startDate && date <= endDate) {
      total++;
      const status = String(row[1]).trim();
      if (status === 'حاضر') {
        attended++;
      }
    }
  });

  return { attended, total };
};

const extractExamScores = (
  workbook: XLSX.WorkBook,
  startDate?: Date,
  endDate?: Date
): Record<string, ExamData> => {
  const results: Record<string, ExamData> = {};
  
  workbook.SheetNames.forEach(sheetName => {
    // Skip sheets with these names
    if (sheetName.includes("Tabelle") || sheetName.includes("الطالب")) {
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as WorksheetData;

    // Find the exam row
    const examRowIndex = data.findIndex(row => 
      row && row.some(cell => 
        cell && String(cell).includes("امتحان الفصل الدراسى الأول")
      )
    );

    if (examRowIndex !== -1 && examRowIndex + 2 < data.length) {
      const sectionRow = data[examRowIndex + 1]?.filter(cell => cell != null) || [];
      const scoresRow = data[examRowIndex + 2]?.filter(cell => cell != null) || [];

      // Only keep sections that have corresponding scores
      const validSections: string[] = [];
      const validScores: number[] = [];
      
      for (let i = 0; i < Math.min(sectionRow.length, scoresRow.length); i++) {
        if (sectionRow[i] != null && scoresRow[i] != null) {
          validSections.push(String(sectionRow[i]));
          validScores.push(Number(scoresRow[i]));
        }
      }

      if (validSections.length > 0) {
        results[sheetName] = {
          sections: validSections,
          scores: validScores
        };

        // Calculate attendance if dates are provided
        if (startDate && endDate) {
          results[sheetName].attendance = countAttendance(worksheet, startDate, endDate);
        }
      }
    }
  });

  return results;
};

export function FileImport({ onXlsxImport, onCsvImport, translations }: FileImportProps) {
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [pendingWorkbook, setPendingWorkbook] = useState<XLSX.WorkBook | null>(null);

  const processWorkbookWithAttendance = (
    workbook: XLSX.WorkBook,
    startDate: string,
    endDate: string
  ) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const examScores = extractExamScores(workbook, start, end);
    
    // Convert to required format
    if (Object.keys(examScores).length > 0) {
      const firstStudentData = Object.values(examScores)[0];
      const sectionCount = firstStudentData.sections.length;
      const sectionWeight = Math.floor(100 / sectionCount);

      const sections: ExamSection[] = firstStudentData.sections.map((name, index) => ({
        name: { de: name, ar: name },
        weight: index === sectionCount - 1 
          ? 100 - (sectionWeight * (sectionCount - 1)) 
          : sectionWeight
      }));

      const students: Student[] = Object.entries(examScores).map(([studentName, data]) => ({
        id: crypto.randomUUID(),
        name: studentName,
        gender: 'm',
        grades: Object.fromEntries(
          sections.map((section, index) => [section.name.de, data.scores[index]])
        ),
        notes: '',
        attendance: data.attendance || { attended: 0, total: 0 }
      }));

      onXlsxImport(sections, students);
    } else {
      throw new Error('No valid exam data found in the XLSX file');
    }
  };

  const handleXlsxImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {
        cellStyles: true,
        cellFormula: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      setPendingWorkbook(workbook);
      setIsDateRangeModalOpen(true);
    } catch (error) {
      console.error('Error processing XLSX file:', error);
      alert(error instanceof Error 
        ? `Error processing XLSX: ${error.message}` 
        : 'An unexpected error occurred while processing the XLSX file'
      );
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <label className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 cursor-pointer flex items-center gap-2">
          <Upload size={20} />
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={onCsvImport}
          />
          {translations.importCsv}
        </label>

        <label className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 cursor-pointer flex items-center gap-2">
          <Upload size={20} />
          <input
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleXlsxImport}
          />
          {translations.importXlsx}
        </label>
      </div>

      <DateRangeModal
        isOpen={isDateRangeModalOpen}
        onClose={() => {
          setIsDateRangeModalOpen(false);
          setPendingWorkbook(null);
        }}
        onConfirm={(startDate, endDate) => {
          if (pendingWorkbook) {
            processWorkbookWithAttendance(pendingWorkbook, startDate, endDate);
            setIsDateRangeModalOpen(false);
            setPendingWorkbook(null);
          }
        }}
        translations={{
          title: translations.selectDateRange || 'Select Attendance Date Range',
          startDate: translations.startDate || 'Start Date',
          endDate: translations.endDate || 'End Date',
          confirm: translations.confirm || 'Confirm',
          cancel: translations.cancel || 'Cancel'
        }}
      />
    </>
  );
}