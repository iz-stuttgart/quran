'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleDarkMode = (checked: boolean) => {
    const html = document.documentElement;
    if (checked) {
      html.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      html.classList.remove('dark');
      localStorage.theme = 'light';
    }
    setDarkMode(checked);
  };

  if (!mounted) {
    return null;
  }

  return (
    <Switch
      checked={isDarkMode}
      onChange={toggleDarkMode}
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <span className="sr-only">Toggle dark mode</span>
      <div
        className={`
          absolute inset-0 flex items-center justify-between px-1
        `}
      >
        <Sun className="h-4 w-4 text-amber-500" />
        <Moon className="h-4 w-4 text-blue-600" />
      </div>
      <span
        className={`${
          isDarkMode ? 'translate-x-6' : 'translate-x-0'
        } absolute left-0.5 inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out`}
      />
    </Switch>
  );
}