// there will also be an api which send request 

export default function ExpandedMeta({ item }: { item: any }) {
  return (
    <div className="grid grid-cols-2 gap-6 text-sm text-neutral-300">

      <div className="space-y-2">
        <div>
          {item.description} • {item.duration || "—"} • HD
        </div>
        genres
        <div className="flex gap-2 flex-wrap">
          {(item.genres || []).slice(0, 4).map((g: string) => (
            <span key={g} className="px-2 py-0.5 bg-neutral-800 rounded">
              {g},
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <div><span className="text-neutral-500">Type:</span> {item.type}</div>
      </div>
    </div>
  );
}
