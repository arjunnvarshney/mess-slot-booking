export default function ResourceState({
  loading,
  error,
  reload,
  empty = false,
}) {
  if (error)
    return (
      <div className="notice error" role="alert">
        {error} <button onClick={reload}>Retry</button>
      </div>
    );
  if (loading)
    return (
      <p className="muted" role="status">
        Updating…
      </p>
    );
  if (empty) return <p className="empty">No records found.</p>;
  return null;
}
