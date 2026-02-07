"use client";

import { useRouter } from 'next/navigation'; 
import Image from "next/image";
import { Plus } from "lucide-react";

export default function SimilarCard({
  item
}: {
  item: any
}){
  const router = useRouter();
  const minutes = item.duration_or_episode_count || 0;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const year = item.release_date
    ? new Date(item.release_date).getFullYear()
    : "—";

  return (
 <div onClick={() => {
  router.replace(`?open=${item.content_id}`, { scroll: false });
window.scrollTo(0, 0);
}}

  className=" h-[50vh] bg-[#2F2F2F] rounded-md overflow-hidden border-[1px] border-transparent hover:border-neutral-300 transition-all duration-300 cursor-pointer">
      <div className="relative aspect-[16/9] z-0">
        {/* Duration badge positioned on top */}
        <div className="absolute top-2 right-2 z-20">
          <div className="flex items-center gap-2 text-sm bg-black/10 backdrop-blur-sm px-2 py-[1px] rounded">
            <span className="text-neutral-200">
              {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
            </span>
          </div>
        </div>

        {/* Image */}
        <Image
          src={item.poster_1 || "/lo.svg"}
          alt={item.title}
          fill
          className="object-cover text-orange-50"
        />
      </div>
      {/* META */}
      <div className="p-4 pb-0 text-sm text-neutral-300 space-y-2">

        {/* BADGES */}
        <div className="flex items-center gap-2 text-xs justify-between">
          <div className="flex gap-2 items-center">
            <span className="border border-neutral-500 text-sm px-2 py-0.5 rounded">
              U/A 13+
            </span>
            <span className="border border-neutral-500 px-2 h-5 rounded flex items-center justify-center">
              HD
            </span>
            <span className="opacity-90">{year}</span>
          </div>
          <button className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-neutral-500 hover:border-neutral-100 hover:bg-neutral-700 transition-all duration-100">
            <Plus size={26} strokeWidth={1.25} />
          </button>
        </div>
      </div>

        {/* DESCRIPTION */}
        <p className="line-clamp-5 text-neutral-300 leading-snug px-4 pb-4 text-sm">
          {item.description || "No description available."}
        </p>
    </div>
  );
}
