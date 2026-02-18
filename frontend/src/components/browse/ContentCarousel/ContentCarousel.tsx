"use client"

import * as React from "react"
import Card from "../Card/Card"
import styles from "./ContentCarousel.module.css"
import forward from "../../../../public/icons/forward.ico";
import backward from "../../../../public/icons/backward.ico";
import Image from "next/image"

/* Netflix-style skeleton card for carousel */
function SkeletonCard() {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.shimmer} />
        </div>
    );
}

export default function ContentCarousel({
    title = "",
    items = [],
    openId,
    onOpen,
    loading = false  // ✅ NEW: loading prop
}: {
    title?: string;
    items?: any[];
    openId: string | null;
    onOpen: (item: any, rect: DOMRect | null) => void;
    loading?: boolean;  // ✅ NEW
}) {

    const baseItems = React.useMemo(() => {

        const normalized = (Array.isArray(items) ? [...items] : []).map((item, idx) => ({
            ...item,
            id: item.content_id || `content-${idx}`,
            title: item.title || "Untitled",
        }));

        const missing = 36 - normalized.length;
        if (missing > 0) {
            for (let i = 0; i < missing; i++) {
                normalized.push({
                    id: `dummy-${i}`,
                    title: `item[${normalized.length + i}]`,
                    isDummy: true,
                });
            }
        }

        return normalized.map((item, index) => ({
            ...item,
            position: index + 1,
        }));
    }, [items]);

    const total = baseItems.length;
    const [visibleIndices, setVisibleIndices] = React.useState(() => {
        const initial = [];
        for (let i = 0; i < 13; i++) initial.push(i);
        return initial;
    });
    const [translateOffset, setTranslateOffset] = React.useState(0);
    const [marginOffset, setMarginOffset] = React.useState(0);
    const [isTransitioning, setIsTransitioning] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const [hasMovedYet, setHasMovedYet] = React.useState(false);
    const sliderRef = React.useRef<HTMLDivElement | null>(null);
    const transitionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        return () => {
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
    }, []);

    function startTransition() {
        setIsTransitioning(true);
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = setTimeout(() => {
            setIsTransitioning(false);
        }, 1000);
    }

    function goNext() {
        if (isTransitioning) return;
        const sliderContent = sliderRef.current;

        if (!hasMovedYet) {
            const nextItems = Array.from({ length: 6 }, (_, i) => (visibleIndices[visibleIndices.length - 1] + 1 + i) % total);
            const newIndices = [35, ...visibleIndices, ...nextItems];
            setVisibleIndices(newIndices);
            setHasMovedYet(true);

            if (sliderContent) {
                setMarginOffset((prev) => {
                    const newOffset = prev - 15.2;
                    sliderContent.style.marginLeft = `${newOffset}vw`;
                    return newOffset;
                });
            }
        } else {
            const newIndices = [
                ...visibleIndices.slice(6),
                ...Array.from({ length: 6 }, (_, i) => (visibleIndices[visibleIndices.length - 1] + 1 + i) % total),
            ];
            setVisibleIndices(newIndices);

            if (sliderContent) {
                setMarginOffset((prev) => {
                    const newOffset = prev + 91.2;
                    sliderContent.style.marginLeft = `${newOffset}vw`;
                    return newOffset;
                });
            }
        }

        if (sliderContent) {
            setTranslateOffset((prev) => {
                const newOffset = prev - 91.2;
                sliderContent.style.transform = `translateX(${newOffset}vw)`;
                return newOffset;
            });
        }
        startTransition();
    }

    function goPrev() {
        if (isTransitioning) return;
        const sliderContent = sliderRef.current;

        const newIndices = [
            ...Array.from({ length: 6 }, (_, i) => (visibleIndices[0] - 6 + i + total) % total),
            ...visibleIndices.slice(0, -6),
        ];
        setVisibleIndices(newIndices);

        if (sliderContent) {
            setMarginOffset((prev) => {
                const newOffset = prev - 91.2;
                sliderContent.style.marginLeft = `${newOffset}vw`;
                return newOffset;
            });
            setTranslateOffset((prev) => {
                const newOffset = prev + 91.2;
                sliderContent.style.transform = `translateX(${newOffset}vw)`;
                return newOffset;
            });
        }
        startTransition();
    }

    const currentItems = visibleIndices.map((i) => baseItems[i]);

    return (
        <div
            className={`${styles.carousel} ${isHovered ? styles.zHovered : styles.zNormal}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Row title */}
            {title && (
                <h2 className={styles.rowTitle}>
                    {title}
                </h2>
            )}

            {/* Slider */}
            <div className={styles.sliderContainer}>
                {loading ? (
                    /* Show skeleton cards while loading */
                    <div className={styles.skeletonRow}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <>
                        <div
                            ref={sliderRef}
                            className={styles.sliderContent}
                            style={{
                                marginLeft: `${marginOffset}vw`,
                                transform: `translateX(${translateOffset}vw)`,
                            }}
                        >
                            {currentItems.map((item) => {
                                const position = item.position;
                                let cardType: "" | "First" | "Last" = "";
                                if ((position - 1) % 6 === 0) cardType = "First";
                                else if (position % 6 === 0) cardType = "Last";

                                return (
                                    <div key={item.id} data-card-position={position}>
                                        <Card
                                            cardType={cardType}
                                            item={item}
                                            isSelected={openId === item.content_id}
                                            onOpen={onOpen}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {hasMovedYet && (
                            <button onClick={goPrev} className={styles.prevButton}>
                                <Image className={styles.shiftUp} src={backward} alt="prev" width={23} height={23} />
                            </button>
                        )}
                        <button onClick={goNext} className={styles.nextButton}>
                            <Image className={styles.shiftUp} src={forward} alt="next" width={23} height={23} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}