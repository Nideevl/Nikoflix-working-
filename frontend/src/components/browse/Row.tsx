// components/browse/Row.tsx
"use client";

import { useEffect, useState } from "react";
import RowClient from "./RowClient";
import RowSkeleton from "./RowSkeleton";

type RowProps = {
  title: string;
  type: "movies" | "series";
};

export default function Row({ title, type }: RowProps) {
  const [items, setItems] = useState<any[] | null>(null);

  useEffect(() => {
    // simulate loading (frontend-only)
    const timer = setTimeout(() => {
      setItems(
        Array.from({ length: 12 }).map((_, i) => ({
          id: `${type}-${i}`,
          title: `${type.toUpperCase()} ${i + 1}`,
          poster: "/poster-placeholder.jpg",
        }))
      );
    }, 800);

    return () => clearTimeout(timer);
  }, [type]);

  if (!items) {
    return <RowSkeleton title={title} />;
  }

  return <RowClient title={title} items={items} />;
}
