import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { Language, Gender, StudentFormData } from '@/types/grader';

const translations = {
  de: {
    title: 'Neuen Schüler hinzufügen',
    name: {
      m: 'Name des Schülers',
      f: 'Name der Schülerin'
    },
    gender: 'Geschlecht',
    male: 'männlich',
    female: 'weiblich',
    notes: 'Anmerkungen (optional)',
    notesPlaceholder: 'Fügen Sie hier Anmerkungen zum Schüler hinzu...',
    submit: 'Hinzufügen',
    cancel: 'Abbrechen',
    validation: {
      required: 'Dieses Feld ist erforderlich'
    },
    attendance: {
      label: 'Anwesenheit',
      attended: 'Besuchte Stunden',
      total: 'Gesamtstunden'
    }
  },
  ar: {
    title: 'إضافة طالب جديد',
    name: {
      m: 'اسم الطالب',
      f: 'اسم الطالبة'
    },
    gender: 'الجنس',
    male: 'ذكر',
    female: 'أنثى',
    notes: 'ملاحظات (اختياري)',
    notesPlaceholder: 'أضف ملاحظات حول الطالب هنا...',
    submit: 'إضافة',
    cancel: 'إلغاء',
    validation: {
      required: 'هذا الحقل مطلوب'
    },
    attendance: {
      label: 'الحضور',
      attended: 'الحصص المحضورة',
      total: 'إجمالي الحصص'
    }
  }
} as const;

interface StudentFormProps {
  lang: Language;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StudentFormData) => void;
}

export default function StudentForm({
  lang,
  isOpen,
  onClose,
  onSubmit
}: StudentFormProps) {
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [formData, setFormData] = useState<StudentFormData>({
    name: '',
    gender: 'm',
    notes: '',
    attendance: {
      attended: 0,
      total: 0
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.validation.required;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container for centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-xl w-full rounded-lg bg-white shadow-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                {t.title}
              </Dialog.Title>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.name[formData.gender as Gender]}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={`
                    w-full rounded-md shadow-sm 
                    ${errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }
                  `}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Gender Selection */}
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  {t.gender}
                </span>
                <div className="flex gap-6">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={formData.gender === 'm'}
                      onChange={() => setFormData({ ...formData, gender: 'm' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t.male}</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      checked={formData.gender === 'f'}
                      onChange={() => setFormData({ ...formData, gender: 'f' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t.female}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.attendance.label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    value={formData.attendance.attended}
                    onChange={e => setFormData({
                      ...formData,
                      attendance: {
                        ...formData.attendance,
                        attended: +e.target.value
                      }
                    })}
                    placeholder={t.attendance.attended}
                    className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-gray-500 self-center">/</span>
                  <input
                    type="number"
                    min="1"
                    value={formData.attendance.total}
                    onChange={e => setFormData({
                      ...formData,
                      attendance: {
                        ...formData.attendance,
                        total: +e.target.value
                      }
                    })}
                    placeholder={t.attendance.total}
                    className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.notes}
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t.notesPlaceholder}
                  rows={3}
                  className="w-full rounded-md border-gray-300 
                           focus:border-blue-500 focus:ring-blue-500
                           resize-none"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-gray-300 
                         bg-white text-gray-700 text-sm font-medium
                         hover:bg-gray-50 focus:outline-none focus:ring-2
                         focus:ring-offset-2 focus:ring-blue-500"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-md border border-transparent
                         bg-blue-600 text-white text-sm font-medium
                         hover:bg-blue-700 focus:outline-none focus:ring-2
                         focus:ring-offset-2 focus:ring-blue-500"
              >
                {t.submit}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}