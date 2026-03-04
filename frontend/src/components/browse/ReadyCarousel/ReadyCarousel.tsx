"use client"

import * as React from "react"
import Card from "../Card/Card"
import styles from "./ReadyCarousel.module.css"
import { CardItem } from "../Card/types"

export default function ReadyCarousel({
    title = "Ready to Watch",
    items = [],
    openId,
    onOpen,
    loading = false,
}: {
    title?: string;
    items?: CardItem[];
    openId: string | null;
    onOpen: (item: CardItem, rect: DOMRect | null) => void;
    loading?: boolean;
}) {
    const [isHovered, setIsHovered] = React.useState(false);

    const displayItems = React.useMemo(() => {
        const normalized = (Array.isArray(items) ? [...items] : [])
            .slice(0, 6)
            .map((item, idx) => ({
                ...item,
                id: item.content_id || `content-${idx}`,
                title: item.title || "Untitled",
                position: idx + 1,
            }));

        // Pad with dummies if fewer than 6
        while (normalized.length < 6) {
            const idx = normalized.length;
            normalized.push({
                id: `dummy-${idx}`,
                title: `Item ${idx + 1}`,
                isDummy: true,
                position: idx + 1,
            } as any);
        }

        return normalized;
    }, [items]);

    return (
        <div
            className={`${styles.carousel} ${isHovered ? styles.zHovered : styles.zNormal}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {title && (
                <h2 className={styles.rowTitle}>{title}</h2>
            )}

            <div className={styles.sliderContainer}>
                {loading ? (
                    <div className={styles.skeletonRow}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className={styles.skeletonCard}>
                                <div className={styles.shimmer} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.sliderContent}>
                        {displayItems.map((item) => {
                            const position = item.position;
                            let cardType: "" | "First" | "Last" = "";
                            if (position === 1) cardType = "First";
                            else if (position === 6) cardType = "Last";

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
                )}
            </div>
        </div>
    );
}