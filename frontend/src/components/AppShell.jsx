import { BarChart3, LogOut, Upload } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const navLinkClassName = ({ isActive }) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
      : 'bg-white/35 text-text hover:bg-white/60 dark:bg-white/5 dark:hover:bg-white/10'
  }`;

const AppShell = ({ children }) => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="glass-panel-strong sticky top-4 z-20 mb-8 flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-soft">
              AI Resume Analyzer & Job Matcher
            </p>
            <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-text">
              Turn every resume upload into a measurable hiring signal
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap items-center gap-2">
              <NavLink to="/" className={navLinkClassName}>
                <BarChart3 size={16} />
                Dashboard
              </NavLink>
              <NavLink to="/upload" className={navLinkClassName}>
                <Upload size={16} />
                Upload Resume
              </NavLink>
            </nav>

            <ThemeToggle />

            <div className="rounded-full border border-border bg-white/35 px-4 py-2 text-sm dark:bg-white/5">
              <span className="font-semibold text-text">{user?.name}</span>
              <span className="ml-2 text-text-soft">{user?.email}</span>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-4 py-2 text-sm font-semibold text-text transition hover:bg-white/30 dark:hover:bg-white/5"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <main>{children || <Outlet />}</main>
      </div>
    </div>
  );
};

export default AppShell;
