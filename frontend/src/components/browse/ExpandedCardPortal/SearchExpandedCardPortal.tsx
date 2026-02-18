  "use client";

  import Image from "next/image";
  import { useEffect, useMemo, useRef, useState } from "react";
  import { X } from "lucide-react";

  import ExpandedMeta from "./ExpandedMeta";
  import ExpandedActions from "./ExpandedActions";
  import ExpandedEpisodes from "./ExpandedEpisodes";
  import SimilarContentSection from "./SimilarContentSection";
  import CollectionContentSection from "./CollectionContentSection";

  export default function ExpandedCardPortal({
    item,
    originRect,
    onClose
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

    const FINAL_WIDTH_VW = 55.2;

    const OPEN_DURATION = 500;
    const CLOSE_DURATION = 400;
    const HALF_CLOSE = 100;

    const XaPx = originRect?.left || 0;
    const YaPx = originRect?.top || 0;

    // convert px → vw / vh
    const Xa = typeof window !== "undefined"
      ? (XaPx / window.innerWidth) * 100
      : 0;

    const Ya = typeof window !== "undefined"
      ? (YaPx / window.innerHeight) * 100
      : 0;

    const scale = useMemo(() => {
      if (!originRect || typeof window === "undefined") return 0.3;
      const finalWidthPx = (window.innerWidth * FINAL_WIDTH_VW) / 100;
      return Math.max(0.2, Math.min(originRect.width / finalWidthPx, 1));
    }, [originRect]);

    /* 🔹 Replace content when modal already open */
    useEffect(() => {
      if (!mounted) return;

      setHeroSrc(item?.poster_2 || "/lo.svg");
      setClosing(false);
      setContentHidden(false);
    }, [item?.content_id]);

    /* 🔹 OPEN */
    useEffect(() => {
      if (!item) return;

      setMounted(true);
      setClosing(false);
      setContentHidden(false);
      setHeroSrc(item.poster_2 || "/lo.svg");

      // ALWAYS mount at initial state first
      setAnimate(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimate(true);
        });
      });

    }, [item, originRect]);

    /* 🔹 CLOSE */
    const handleClose = () => {
      if (!modalRef.current) return;

      setClosing(true);
      setAnimate(false);

      if (originRect) {
        setTimeout(() => {
          setHeroSrc(item.poster_1 || item.poster_2 || "/lo.svg");
        }, HALF_CLOSE);
      }

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

    return (
      <>
        {/* OVERLAY */}
        <div
          onClick={handleClose}
          className="fixed inset-0 z-1000"
          style={{
            backgroundColor: "rgba(0,0,0,0.7)",
            opacity: animate ? 1 : 0,
            transition: `opacity ${OPEN_DURATION}ms ease-out`,
          }}
        />

        {/* MODAL */}
        <div
          ref={modalRef}
          className="relative z-1001"
          style={{
            left: 0,
            top: 0,
            width: `${FINAL_WIDTH_VW}vw`,

            /* 🔥 DYNAMIC PADDING */
            paddingTop: closing ? "25vh" : "4vh",
            paddingBottom: closing ? "25vh" : "4vh",

            transform: originRect
              ? animate
                ? `translate(40%) scale(1)`
                : `translate(${XaPx}px, ${Ya - 8}vh) scale(${scale})`
              : animate
                ? `translate(40%) scale(1)`
                : `translate(45%) scale(0.90)`,

            transformOrigin: "0px 0px",

            opacity: closing
              ? originRect
                ? 0.8
                : 0.1
              : 1,

            transition: `
        transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity ${duration}ms ease,
        padding ${duration}ms ease
      `,
          }}
        >

          <div className="rounded-[7px] shadow-2xl overflow-hidden bg-[#181818]  border-black border-[1px]">

            {/* CLOSE */}
            <button
              onClick={handleClose}
              className="fixed top-13 right-4 z-1100 bg-neutral-900 rounded-full p-[5]"
              style={{
                opacity: closing ? 0 : 1
              }}
            >
              <X color={"white"} size={28} strokeWidth={1.5} />
            </button>

            {/* HERO IMAGE */}
            <div
              className="relative"
              style={{
                height: heroHeight,
                transition: `height ${CLOSE_DURATION}ms ease`,
              }}
            >
              <Image
                src={heroSrc || "/lo.svg"}
                alt={item.title}
                fill
                className="object-cover px-[0.3] translate-x-[0.5px]"
                style={{
                  opacity: closing ? 0.7 : 1,
                  transition: `opacity ${CLOSE_DURATION}ms ease`,
                }}
              />

              <div
                className="separator-shade"
                style={{
                  opacity: closing ? 0 : 1,
                  transition: "none",
                }}
              />

              <div
                className="absolute left-12 bottom-23 z-10"
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
                onWheel={(e) => e.stopPropagation()}
                className="px-12 pb-[20vh] py-5 space-y-10 -mt-[3.5vh] z-20 relative bg-[#181818] rounded-[7px]"
                style={{
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  opacity: closing ? 0.75 : 1
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
      </>
    );
  }
