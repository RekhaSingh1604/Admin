export default function EmptyState({
  title = "No data found",
  message = "There is nothing to display.",
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}