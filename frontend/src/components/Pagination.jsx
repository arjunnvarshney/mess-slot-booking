export default function Pagination({ data, page, setPage }) {
  if (!data) return null;
  const pages = Math.max(1, Math.ceil(data.total / data.limit));
  return (
    <div className="pagination">
      <span>
        {data.total} records · Page {page} of {pages}
      </span>
      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
        Previous
      </button>
      <button disabled={page >= pages} onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
