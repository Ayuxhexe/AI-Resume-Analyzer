const variants = {
  primary: 'border-teal-500/25 bg-teal-500/10 text-teal-700 dark:text-teal-200',
  accent: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  danger: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-200',
};

const SkillBadge = ({ label, variant = 'primary' }) => (
  <span
    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${variants[variant]}`}
  >
    {label}
  </span>
);

export default SkillBadge;
