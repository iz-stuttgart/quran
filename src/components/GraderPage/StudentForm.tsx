import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

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
    }
  }
} as const;

interface StudentFormData {
  name: string;
  gender: 'f' | 'm';
  notes?: string;
}

interface StudentFormProps {
  lang: 'de' | 'ar';
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  
  const [formData, setFormData] = React.useState<StudentFormData>({
    name: '',
    gender: 'm',
    notes: ''
  });
  
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Handle dialog open/close
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      // Reset form when opening
      setFormData({ name: '', gender: 'm', notes: '' });
      setErrors({});
    } else {
      dialog.close();
    }
  }, [isOpen]);

  // Handle click outside dialog
  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    const dialogDimensions = dialogRef.current?.getBoundingClientRect();
    if (!dialogDimensions) return;

    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      onClose();
    }
  };

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
    <dialog
      ref={dialogRef}
      className={`
        p-0 rounded-lg shadow-xl backdrop:bg-black backdrop:bg-opacity-50
        min-w-[90vw] md:min-w-[600px] border border-gray-200
        open:animate-fade-in
      `}
      onClick={handleDialogClick}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="p-6" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{t.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.name[formData.gender]}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`
                w-full px-3 py-2 rounded-md
                border ${errors.name ? 'border-red-500' : 'border-gray-300'}
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Gender Selection */}
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              {t.gender}
            </span>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.gender === 'm'}
                  onChange={() => setFormData({ ...formData, gender: 'm' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{t.male}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={formData.gender === 'f'}
                  onChange={() => setFormData({ ...formData, gender: 'f' })}
                  className="w-4 h-4 text-blue-600"
                />
                <span>{t.female}</span>
              </label>
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
              className="
                w-full px-3 py-2 rounded-md
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-blue-500
                resize-none
              "
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 rounded-md
                border border-gray-300
                text-gray-700 hover:bg-gray-50
              "
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="
                px-4 py-2 rounded-md
                bg-blue-600 hover:bg-blue-700
                text-white
              "
            >
              {t.submit}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}