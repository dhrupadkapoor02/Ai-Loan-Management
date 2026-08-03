export default function ProgressBar({ percent, danger = false }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const colorClass = danger || percent >= 100 ? "bg-red-500" : percent >= 80 ? "bg-yellow-500" : "bg-primary-600";

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
      <div className={`h-full rounded-full transition-all ${colorClass}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}
