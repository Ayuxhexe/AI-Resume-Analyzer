const toneClasses = {
  teal: 'from-teal-500/20 to-cyan-500/5',
  amber: 'from-amber-500/20 to-orange-500/5',
  coral: 'from-rose-500/20 to-red-500/5',
  slate: 'from-slate-500/20 to-transparent',
};

const SummaryCard = ({ title, value, description, tone = 'teal' }) => (
  <div className="glass-panel-strong relative overflow-hidden p-5">
    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${toneClasses[tone]}`} />
    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-text-soft">{title}</p>
    <p className="mt-4 font-heading text-3xl font-semibold tracking-tight text-text">{value}</p>
    <p className="mt-2 text-sm text-text-soft">{description}</p>
  </div>
);

export default SummaryCard;
