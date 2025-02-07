import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const translations = {
  de: {
    severity: {
      error: 'Fehler',
      warning: 'Warnung',
      success: 'Erfolg'
    }
  },
  ar: {
    severity: {
      error: 'خطأ',
      warning: 'تحذير',
      success: 'نجاح'
    }
  }
} as const;

type MessageSeverity = 'error' | 'warning' | 'success';

interface ValidationMessageProps {
  message: string;
  severity?: MessageSeverity;
  lang: 'de' | 'ar';
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    colors: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: 'text-red-400'
    }
  },
  warning: {
    icon: AlertTriangle,
    colors: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: 'text-yellow-400'
    }
  },
  success: {
    icon: CheckCircle,
    colors: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-400'
    }
  }
} as const;

export default function ValidationMessage({
  message,
  severity = 'error',
  lang
}: ValidationMessageProps) {
  const t = translations[lang];
  const isRTL = lang === 'ar';
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div 
      className={`
        flex items-start gap-2 p-3 rounded-md
        ${config.colors.bg} ${config.colors.border} ${config.colors.text}
        border animate-fade-in
      `}
      dir={isRTL ? 'rtl' : 'ltr'}
      role="alert"
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.colors.icon}`} />
      <div className="flex-1">
        <span className="sr-only">{t.severity[severity]}: </span>
        {message}
      </div>
    </div>
  );
}