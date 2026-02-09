"use client"

import { useEffect, useState } from "react";

export function useScrollConstraints(
  ref: React.RefObject<HTMLElement>,
  isActive: boolean
) {
  const [constraints, setConstraints] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    if (!ref.current || !isActive) return;

    const element = ref.current;
    const contentHeight = element.scrollHeight;
    const containerHeight = element.parentElement?.offsetHeight || 0;

    setConstraints({
      top: 0,
      bottom: Math.max(contentHeight - containerHeight, 0),
    });
  }, [ref, isActive]);

  return constraints;
}