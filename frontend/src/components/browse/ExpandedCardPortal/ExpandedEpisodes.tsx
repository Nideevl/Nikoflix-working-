export default function ExpandedEpisodes() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Episodes</h3>

      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 bg-neutral-900 p-4 rounded"
        >
          <div className="w-40 h-24 bg-neutral-800 rounded" />
          <div>
            <h4 className="font-medium">Episode {i + 1}</h4>
            <p className="text-sm text-neutral-400">
              Short episode description goes here.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
