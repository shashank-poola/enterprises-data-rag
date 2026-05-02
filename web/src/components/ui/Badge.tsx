const STATUS: Record<string, string> = {
  indexed: "bg-green-50 text-green-700 border-green-200",
  indexing: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-stone-50 text-stone-600 border-stone-200",
  failed: "bg-red-50 text-red-700 border-red-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${
        STATUS[status] ?? STATUS.pending
      }`}
    >
      {status === "indexing" && (
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse" />
      )}
      {status}
    </span>
  );
}
