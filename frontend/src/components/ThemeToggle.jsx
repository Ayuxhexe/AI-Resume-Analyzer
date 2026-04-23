import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-white/40 px-4 py-2 text-sm font-semibold text-text shadow-sm transition hover:-translate-y-0.5 dark:bg-white/5"
    >
      {theme === 'dark' ? <SunMedium size={16} /> : <Moon size={16} />}
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
};

export default ThemeToggle;
