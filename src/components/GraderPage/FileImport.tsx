import React from 'react';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { ExamSection, Student } from '@/types/grader';

interface FileImportProps {
  onXlsxImport: (sections: ExamSection[], students: Student[]) => void;
  onCsvImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  translations: {
    importCsv: string;
    importXlsx: string;
  };
}

type WorksheetRow = (string | number | null | undefined)[];
type WorksheetData = WorksheetRow[];

export function FileImport({ onXlsxImport, onCsvImport, translations }: FileImportProps) {
  const extractExamScores = (workbook: XLSX.WorkBook) => {
    const results: Record<string, { sections: string[]; scores: number[] }> = {};
    
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
        }
      }
    });

    return results;
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

      const examScores = extractExamScores(workbook);
      
      // Convert to required format
      if (Object.keys(examScores).length > 0) {
        // Get sections from the first student (they should be the same for all)
        const firstStudentData = Object.values(examScores)[0];
        const sectionCount = firstStudentData.sections.length;
        const sectionWeight = Math.floor(100 / sectionCount);

        // Create exam sections
        const sections: ExamSection[] = firstStudentData.sections.map((name, index) => ({
          name: {
            de: name,
            ar: name
          },
          weight: index === sectionCount - 1 
            ? 100 - (sectionWeight * (sectionCount - 1)) 
            : sectionWeight
        }));

        // Create students with their grades
        const students: Student[] = Object.entries(examScores).map(([studentName, data]) => {
          const student: Student = {
            id: crypto.randomUUID(),
            name: studentName,
            gender: 'm',
            grades: {},
            notes: ''
          };

          // Assign grades
          sections.forEach((section, index) => {
            const score = data.scores[index];
            if (!isNaN(score)) {
              student.grades[section.name.de] = score;
            }
          });

          return student;
        });

        onXlsxImport(sections, students);
      } else {
        throw new Error('No valid exam data found in the XLSX file');
      }
    } catch (error) {
      console.error('Error processing XLSX file:', error);
      alert(error instanceof Error 
        ? `Error processing XLSX: ${error.message}` 
        : 'An unexpected error occurred while processing the XLSX file'
      );
    }
  };

  return (
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
  );
}