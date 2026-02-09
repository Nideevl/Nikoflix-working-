"use client"

import { RefObject } from "react";
import { MotionValue } from "framer-motion";
import {useEffect} from 'react'

export function useWheelScroll(
  ref: RefObject<HTMLElement>,
  y: MotionValue<number>,
  constraints: { top: number; bottom: number },
  onDismiss: () => void,
  isActive: boolean
) {
  useEffect(() => {
    if (!ref.current || !isActive) return;

    const element = ref.current;

    const handleWheel = (e: WheelEvent) => {
      if (!isActive) return;

      const currentY = y.get();
      const newY = currentY + e.deltaY;

      // Apply constraints
      if (newY < constraints.top) {
        y.set(constraints.top);
      } else if (newY > constraints.bottom) {
        y.set(constraints.bottom);
        
        // Check if we've scrolled past dismiss threshold
        if (newY - constraints.bottom > 150) {
          onDismiss();
        }
      } else {
        y.set(newY);
      }
    };

    element.addEventListener("wheel", handleWheel);
    return () => element.removeEventListener("wheel", handleWheel);
  }, [ref, y, constraints, onDismiss, isActive]);
}