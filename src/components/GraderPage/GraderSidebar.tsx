import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { ExamSection, Language, ValidationErrors, WEIGHT_CONSTRAINTS } from '@/types/grader';

const translations = {
  de: {
    basicInfo: {
      title: 'Grundinformationen',
      schoolYear: 'Schuljahr',
      classroom: 'Gruppe',
      examDate: 'Prüfungsdatum'
    },
    sections: {
      title: 'Prüfungsteile',
      addSection: 'Neuen Prüfungsteil hinzufügen',
      nameGerman: 'Name (Deutsch)',
      nameArabic: 'Name (Arabisch)',
      weight: 'Gewichtung (%)',
      totalWeight: 'Gesamtgewichtung',
      remove: 'Prüfungsteil entfernen'
    },
    validation: {
      required: 'Dieses Feld ist erforderlich',
      weightSum: 'Die Summe der Gewichtungen muss 100% ergeben',
      invalidWeight: 'Gewichtung muss zwischen 1 und 100 liegen'
    }
  },
  ar: {
    basicInfo: {
      title: 'المعلومات الأساسية',
      schoolYear: 'السنة الدراسية',
      classroom: 'الفوج',
      examDate: 'تاريخ الإختبار'
    },
    sections: {
      title: 'أقسام الإختبار',
      addSection: 'إضافة قسم جديد',
      nameGerman: 'الإسم (بالألمانية)',
      nameArabic: 'الإسم (بالعربية)',
      weight: 'النسبة (%)',
      totalWeight: 'مجموع النسب',
      remove: 'حذف القسم'
    },
    validation: {
      required: 'هذا الحقل مطلوب',
      weightSum: 'مجموع النسب يجب أن يساوي 100%',
      invalidWeight: 'النسبة يجب أن تكون بين 1 و 100'
    }
  }
} as const;

interface GraderSidebarProps {
  lang: Language;
  schoolYear: string;
  classroom: string;
  examDate: string;
  examSections: ExamSection[];
  errors: ValidationErrors;
  onSchoolYearChange: (value: string) => void;
  onClassroomChange: (value: string) => void;
  onExamDateChange: (value: string) => void;
  onExamSectionsChange: (sections: ExamSection[]) => void;
}

export default function GraderSidebar({
  lang,
  schoolYear,
  classroom,
  examDate,
  examSections,
  errors,
  onSchoolYearChange,
  onClassroomChange,
  onExamDateChange,
  onExamSectionsChange
}: GraderSidebarProps) {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  
  const totalWeight = examSections.reduce((sum, section) => sum + section.weight, 0);
  const hasWeightError = totalWeight !== WEIGHT_CONSTRAINTS.TOTAL;

  const handleAddSection = () => {
    const newSection: ExamSection = {
      name: {
        de: '',
        ar: ''
      },
      weight: 0
    };
    onExamSectionsChange([...examSections, newSection]);
  };

  const handleRemoveSection = (index: number) => {
    onExamSectionsChange(examSections.filter((_, i) => i !== index));
  };

  const handleSectionChange = (index: number, field: 'name.de' | 'name.ar' | 'weight', value: string | number) => {
    const updatedSections = [...examSections];
    
    if (field === 'name.de' || field === 'name.ar') {
      const lang = field.split('.')[1] as 'de' | 'ar';
      updatedSections[index] = {
        ...updatedSections[index],
        name: {
          ...updatedSections[index].name,
          [lang]: value
        }
      };
    } else if (field === 'weight') {
      const weightValue = Math.min(WEIGHT_CONSTRAINTS.MAX, Math.max(WEIGHT_CONSTRAINTS.MIN, Number(value) || 0));
      updatedSections[index] = {
        ...updatedSections[index],
        weight: weightValue
      };
    }
    
    onExamSectionsChange(updatedSections);
  };

  return (
    <div className="divide-y divide-gray-200">
      {/* Basic Information Section */}
      <section className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t.basicInfo.title}
        </h3>
        
        <div className="space-y-4">
          {/* School Year Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.basicInfo.schoolYear}
            </label>
            <div className="relative">
              <input
                type="text"
                value={schoolYear}
                onChange={(e) => onSchoolYearChange(e.target.value)}
                className={`
                  w-full rounded-md shadow-sm
                  ${errors.schoolYear 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }
                `}
              />
              {errors.schoolYear && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.schoolYear && (
              <p className="mt-1 text-sm text-red-600">{errors.schoolYear}</p>
            )}
          </div>

          {/* Classroom Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.basicInfo.classroom}
            </label>
            <div className="relative">
              <input
                type="text"
                value={classroom}
                onChange={(e) => onClassroomChange(e.target.value)}
                className={`
                  w-full rounded-md shadow-sm
                  ${errors.classroom 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }
                `}
              />
              {errors.classroom && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.classroom && (
              <p className="mt-1 text-sm text-red-600">{errors.classroom}</p>
            )}
          </div>

          {/* Exam Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.basicInfo.examDate}
            </label>
            <div className="relative">
              <input
                type="date"
                value={examDate}
                onChange={(e) => onExamDateChange(e.target.value)}
                className={`
                  w-full rounded-md shadow-sm
                  ${errors.examDate 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }
                `}
              />
              {errors.examDate && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.examDate && (
              <p className="mt-1 text-sm text-red-600">{errors.examDate}</p>
            )}
          </div>
        </div>
      </section>

      {/* Exam Sections */}
      <section className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {t.sections.title}
          </h3>
          <button
            type="button"
            onClick={handleAddSection}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4 mr-1" aria-hidden="true" />
            {t.sections.addSection}
          </button>
        </div>

        <div className="space-y-4">
          {examSections.map((section, index) => (
            <div
              key={index}
              className="relative p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <button
                type="button"
                onClick={() => handleRemoveSection(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                aria-label={t.sections.remove}
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.sections.nameGerman}
                  </label>
                  <input
                    type="text"
                    value={section.name.de}
                    onChange={(e) => handleSectionChange(index, 'name.de', e.target.value)}
                    className="w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.sections.nameArabic}
                  </label>
                  <input
                    type="text"
                    value={section.name.ar}
                    onChange={(e) => handleSectionChange(index, 'name.ar', e.target.value)}
                    className="w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    dir="rtl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.sections.weight}
                  </label>
                  <input
                    type="number"
                    min={WEIGHT_CONSTRAINTS.MIN}
                    max={WEIGHT_CONSTRAINTS.MAX}
                    value={section.weight}
                    onChange={(e) => handleSectionChange(index, 'weight', e.target.value)}
                    className="w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Total Weight Display */}
          <div className={`
            mt-4 p-3 rounded-md text-sm
            ${hasWeightError 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
            }
          `}>
            <p className="font-medium">
              {t.sections.totalWeight}: {totalWeight}%
            </p>
            {hasWeightError && (
              <p className="mt-1 text-sm">
                {t.validation.weightSum}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}