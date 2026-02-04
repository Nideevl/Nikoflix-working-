"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";

import ExpandedMeta from "./ExpandedMeta";
import ExpandedActions from "./ExpandedActions";
import ExpandedEpisodes from "./ExpandedEpisodes";
import SimilarContentSection from "./SimilarContentSection";
import CollectionContentSection from "./CollectionContentSection"

export default function ExpandedCardPortal({
  item,
  originRect,
  onClose,
}: {
  item: any | null;
  originRect: DOMRect | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [closing, setClosing] = useState(false);
  const [contentHidden, setContentHidden] = useState(false);

  const heroHeight = "70vh";
  const [heroSrc, setHeroSrc] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement | null>(null);
  const modalBodyRef = useRef<HTMLDivElement | null>(null);
  const scrollOffsetRef = useRef(0);

  const FINAL_WIDTH_VW = 55.2;

  const OPEN_DURATION = 500;
  const CLOSE_DURATION = 400;
  const HALF_CLOSE = CLOSE_DURATION / 2;

  const Xa = originRect?.left || 0;
  const Ya = originRect?.top || 0;

  const scale = useMemo(() => {
    if (!originRect || typeof window === "undefined") return 0.3;
    const finalWidthPx = (window.innerWidth * FINAL_WIDTH_VW) / 100;
    return Math.max(0.2, Math.min(originRect.width / finalWidthPx, 1));
  }, [originRect]);

  const modalLeftPx = typeof window !== "undefined"
    ? window.innerWidth * 0.2
    : 0;

  const modalTopPx = typeof window !== "undefined"
    ? window.innerHeight * 0.05
    : 0;

  // OPEN
  useEffect(() => {
    if (!item || !originRect) return;

    setMounted(true);
    setClosing(false);
    setContentHidden(false);
    setAnimate(false);
    setHeroSrc(item.poster_2 || "/lo.svg");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimate(true));
    });
  }, [item, originRect]);

  // CLOSE
  const handleClose = () => {
    if (!modalRef.current) return;

    setClosing(true);
    setAnimate(false);
    // swap image midway
    setTimeout(() => {
      setHeroSrc(item.poster_1 || item.poster_2 || "/lo.svg");
    }, HALF_CLOSE);

    // hide body midway
    setTimeout(() => {
      setContentHidden(true);
    }, HALF_CLOSE);

    setTimeout(() => {
      setMounted(false);
      onClose();
    }, CLOSE_DURATION);
  };

  if (!mounted || !item) return null;

  const duration = closing ? CLOSE_DURATION : OPEN_DURATION;

  return createPortal(
    <>
      {/* OVERLAY */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-1000"
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          opacity: animate ? 1 : 0,
          transition: `opacity ${OPEN_DURATION}ms ease-out`,
        }}
      />

      {/* MODAL */}
      <div
        ref={modalRef}
        className="relative z-1001 bg-transparent"
        style={{
          left: 0,
          top: 0,
          width: `${FINAL_WIDTH_VW}vw`,
          transform: animate
            ? `translate(40%, 4vh) scale(1)`
            : `translate(${Xa}px, ${Ya}px) scale(${scale})`,
          transformOrigin: "0px 0px",
          opacity: closing ? 0.5 : 1,
          transition: `
  transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1),
  opacity ${duration}ms ease
`,

        }}
      >
        <div className="bg-[#141414] rounded-[7px] shadow-2xl overflow-hidden">

          {/* CLOSE */}
          <button
            onClick={handleClose}
            className="fixed top-4 right-4 z-1100 bg-gray-900 rounded-full p-[4]"
            style={{
              opacity: closing ? 0 : 1
            }}
          >
            <X color={"white"} size={28} strokeWidth={1.5}/>
          </button>

          {/* HERO IMAGE */}
          <div
            className="relative overflow-hidden"
            style={{
              height: heroHeight,
              transition: `height ${CLOSE_DURATION}ms ease`,
            }}
          >
            {/* IMAGE — animated */}
            <Image
              src={heroSrc || "/lo.svg"}
              alt={item.title}
              fill
              className="object-cover px-[0.4]"
              style={{
                opacity: closing ? 0.2 : 1,
                transition: `opacity ${CLOSE_DURATION}ms ease`,
              }}
            />

            {/* GRADIENT — CUT INSTANTLY */}
            <div
              className="separator-shade"
              style={{
                opacity: closing ? 0 : 1,
                transition: "none",
              }}
            />

            {/* ACTIONS — CUT INSTANTLY */}
            <div
              className="absolute left-8 bottom-23 z-10"
              style={{
                opacity: closing ? 0 : 1,
                transition: "none",
              }}
            >
              <ExpandedActions item={item} />
            </div>
          </div>


          {/* BODY */}
          {!contentHidden && (
            <div
              ref={modalBodyRef}
              onScroll={(e) => {
                scrollOffsetRef.current = e.currentTarget.scrollTop;
              }}
              className="big px-8 py-10 space-y-10 -mt-[6vh] z-20 relative bg-[#141414]"
              style={{
                opacity: closing ? 0.5 : 1,
                transition: "opacity 400ms ease",
              }}
            >
              <ExpandedMeta item={item} />

              {item.type === "series" && <ExpandedEpisodes />}

              <CollectionContentSection item={item} />
              <SimilarContentSection item={item} />

            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
