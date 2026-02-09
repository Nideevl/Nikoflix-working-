// components/browse/RowClient.tsx
"use client"

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

type Item = {
  id: string;
  title: string;
  poster: string;
};

export default function RowClient({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    rowRef.current?.scrollBy({
      left: dir === "left" ? -600 : 600,
      behavior: "smooth",
    });
  };

  return (
    <section className="px-12 mt-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>

      <div className="relative group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 z-10 
          hidden group-hover:flex items-center bg-black/60 px-2"
        >
          <ChevronLeft size={28} />
        </button>

        <div
          ref={rowRef}
          className="flex gap-3 overflow-x-scroll scrollbar-hide"
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="min-w-[160px] transition-transform duration-300 
              hover:scale-110 hover:z-10"
            >
              <Image
                src={item.poster}
                alt={item.title}
                width={160}
                height={240}
                className="rounded"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 z-10 
          hidden group-hover:flex items-center bg-black/60 px-2"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </section>
  );
}
    