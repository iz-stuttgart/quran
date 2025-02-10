import React from 'react';
import { Language, GradedExamSection } from '@/types/grader';

interface WeightedGradesTableProps {
  examSections: GradedExamSection[];
  lang: Language;
  showWeights?: boolean; // New optional parameter for showing/hiding weights
}

const translations = {
  de: {
    evaluationTitle: 'Bewertungskriterien',
    weight: 'Gewichtung',
    studentGrade: 'Note',
    totalGrade: 'Gesamtnote'
  },
  ar: {
    evaluationTitle: 'فرع التقيييم',
    weight: 'الوزن',
    studentGrade: 'العلامة',
    totalGrade: 'المجموع النهائي'
  }
} as const;

// Updated to handle cases where weights are not used
const calculateTotalGrade = (examSections: GradedExamSection[], useWeights: boolean): number | null => {
  const validGrades = examSections.every(section =>
    typeof section.grade === 'number' &&
    section.grade >= 1 &&
    section.grade <= 6
  );

  if (!validGrades) return null;

  if (useWeights) {
    const totalWeight = examSections.reduce((sum, section) => sum + section.weight, 0);
    if (totalWeight !== 100) return null;

    const weightedSum = examSections.reduce((sum, section) =>
      sum + ((section.grade || 0) * section.weight), 0);

    return Number((weightedSum / 100).toFixed(1));
  } else {
    // Simple average when not using weights
    const sum = examSections.reduce((acc, section) => acc + (section.grade || 0), 0);
    return Number((sum / examSections.length).toFixed(1));
  }
};

const WeightedGradesTable: React.FC<WeightedGradesTableProps> = ({ 
  examSections, 
  lang, 
  showWeights = false // Default to false as requested
}) => {
  const isRTL = lang === 'ar';
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const t = translations[lang];

  // Only calculate start positions if weights are being shown
  const getStartPosition = (index: number): number => {
    if (!showWeights) return 0;
    return examSections
      .slice(0, index)
      .reduce((sum, section) => sum + section.weight, 0);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="w-full border-collapse bg-white table-fixed">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
            <th className={`p-2 border-b border-gray-200 ${textAlign} text-gray-700 text-sm ${
              showWeights ? 'w-1/3' : 'w-1/2'
            }`}>
              {t.evaluationTitle}
            </th>
            {showWeights && (
              <th className="p-2 border-b border-gray-200 text-center text-gray-700 text-sm w-1/3">
                {t.weight}
              </th>
            )}
            <th className={`p-2 border-b border-gray-200 text-center text-gray-700 text-sm ${
              showWeights ? 'w-1/3' : 'w-1/2'
            }`}>
              {t.studentGrade}
            </th>
          </tr>
        </thead>
        <tbody>
          {examSections.map((section, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="p-2 border-b border-gray-200 text-sm">
                {section.name[lang]}
              </td>
              {showWeights && (
                <td className="p-2 border-b border-gray-200">
                  <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="absolute inset-0">
                      <div
                        className="absolute h-full bg-green-600 transition-all duration-300"
                        style={{
                          left: `${getStartPosition(index)}%`,
                          width: `${section.weight}%`
                        }}
                      />
                    </div>
                  </div>
                </td>
              )}
              <td className="p-2 border-b border-gray-200 text-center font-medium text-sm">
                {section.grade?.toFixed(1) || ''}
              </td>
            </tr>
          ))}
          <tr className="font-bold bg-green-50">
            <td colSpan={showWeights ? 2 : 1} className="p-2 border-t-2 border-green-200 text-sm">
              {t.totalGrade}
            </td>
            <td className="p-2 border-t-2 border-green-200 text-center text-green-900 text-sm">
              {calculateTotalGrade(examSections, showWeights)?.toFixed(1) || ''}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default WeightedGradesTable;