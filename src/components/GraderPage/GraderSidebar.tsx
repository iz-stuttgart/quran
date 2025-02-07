import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ExamSection } from '@/types/grader';

// Define translations for sidebar-specific content
const translations = {
  de: {
    title: 'Klassendaten',
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
      totalWeight: 'Gesamtgewichtung'
    },
    validation: {
      required: 'Dieses Feld ist erforderlich',
      weightSum: 'Die Summe der Gewichtungen muss 100% ergeben',
      invalidWeight: 'Gewichtung muss zwischen 1 und 100 liegen'
    }
  },
  ar: {
    title: 'بيانات الفصل',
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
      totalWeight: 'مجموع النسب'
    },
    validation: {
      required: 'هذا الحقل مطلوب',
      weightSum: 'مجموع النسب يجب أن يساوي 100%',
      invalidWeight: 'النسبة يجب أن تكون بين 1 و 100'
    }
  }
} as const;

interface GraderSidebarProps {
  lang: 'de' | 'ar';
  schoolYear: string;
  classroom: string;
  examDate: string;
  examSections: ExamSection[];
  errors: Record<string, string>;
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
  
  // Calculate total weight of all sections for validation display
  const totalWeight = examSections.reduce((sum, section) => sum + section.weight, 0);

  // Handler for adding a new exam section
  const handleAddSection = () => {
    // Create a new section with default values
    const newSection: ExamSection = {
      name: {
        de: '',
        ar: ''
      },
      weight: 0
    };
    onExamSectionsChange([...examSections, newSection]);
  };

  // Handler for removing an exam section
  const handleRemoveSection = (index: number) => {
    const updatedSections = examSections.filter((_, i) => i !== index);
    onExamSectionsChange(updatedSections);
  };

  // Handler for updating section values
  const handleSectionChange = (index: number, field: keyof ExamSection | 'name.de' | 'name.ar', value: string | number) => {
    const updatedSections = [...examSections];
    
    // Handle nested name object updates
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
      // Convert weight to number and validate
      const weightValue = Math.min(100, Math.max(0, Number(value) || 0));
      updatedSections[index] = {
        ...updatedSections[index],
        [field]: weightValue
      };
    }
    
    onExamSectionsChange(updatedSections);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Basic Information Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">{t.basicInfo.title}</h3>
        <div className="space-y-4">
          {/* School Year Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.basicInfo.schoolYear}
            </label>
            <input
              type="text"
              value={schoolYear}
              onChange={(e) => onSchoolYearChange(e.target.value)}
              className={`w-full border rounded-md p-2 ${errors.schoolYear ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.schoolYear && (
              <p className="text-red-500 text-sm mt-1">{errors.schoolYear}</p>
            )}
          </div>

          {/* Classroom Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.basicInfo.classroom}
            </label>
            <input
              type="text"
              value={classroom}
              onChange={(e) => onClassroomChange(e.target.value)}
              className={`w-full border rounded-md p-2 ${errors.classroom ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.classroom && (
              <p className="text-red-500 text-sm mt-1">{errors.classroom}</p>
            )}
          </div>

          {/* Exam Date Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.basicInfo.examDate}
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => onExamDateChange(e.target.value)}
              className={`w-full border rounded-md p-2 ${errors.examDate ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.examDate && (
              <p className="text-red-500 text-sm mt-1">{errors.examDate}</p>
            )}
          </div>
        </div>
      </section>

      {/* Exam Sections */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t.sections.title}</h3>
          <button
            onClick={handleAddSection}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">{t.sections.addSection}</span>
          </button>
        </div>

        {/* Section List */}
        <div className="space-y-6">
          {examSections.map((section, index) => (
            <div key={index} className="border rounded-lg p-4 relative">
              {/* Remove Section Button */}
              <button
                onClick={() => handleRemoveSection(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                aria-label="Remove section"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Section Form Fields */}
              <div className="grid grid-cols-1 gap-4">
                {/* German Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.sections.nameGerman}
                  </label>
                  <input
                    type="text"
                    value={section.name.de}
                    onChange={(e) => handleSectionChange(index, 'name.de', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>

                {/* Arabic Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.sections.nameArabic}
                  </label>
                  <input
                    type="text"
                    value={section.name.ar}
                    onChange={(e) => handleSectionChange(index, 'name.ar', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                    dir="rtl"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.sections.weight}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={section.weight}
                    onChange={(e) => handleSectionChange(index, 'weight', e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Total Weight Display */}
          <div className={`text-right ${totalWeight !== 100 ? 'text-red-500' : 'text-green-600'}`}>
            {t.sections.totalWeight}: {totalWeight}%
            {totalWeight !== 100 && (
              <p className="text-sm mt-1">{t.validation.weightSum}</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}