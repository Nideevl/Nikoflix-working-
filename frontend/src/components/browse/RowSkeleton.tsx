// components/browse/RowSkeleton.tsx
export default function RowSkeleton({ title }: { title: string }) {
  return (
    <section className="px-12 mt-8 animate-pulse">
      <div className="h-5 w-40 bg-gray-700 mb-4 rounded" />
      <div className="flex gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-[160px] h-[240px] bg-gray-800 rounded"
          />
        ))}
      </div>
    </section>
  );
}
