const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-text-soft">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent/20 border-t-accent" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export default LoadingSpinner;
