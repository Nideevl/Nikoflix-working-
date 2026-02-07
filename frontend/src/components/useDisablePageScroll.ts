"use client";

import { useEffect } from "react";

export default function useDisablePageScroll() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflowY;
    const prevBodyOverflow = body.style.overflow;

    // disable global scroll
    html.style.overflowY = "auto";
    body.style.overflow = "hidden";

    return () => {
      // restore when leaving playback page
      html.style.overflowY = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);
}
