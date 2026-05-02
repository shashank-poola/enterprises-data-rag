export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`bg-stone-200 rounded animate-pulse ${className ?? ""}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <Skeleton className="h-6 w-1/2" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-3">
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}
