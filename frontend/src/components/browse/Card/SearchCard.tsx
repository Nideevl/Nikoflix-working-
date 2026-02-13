"use client";

import { useState, useRef } from "react";
import { CardProps } from "./types";
import CardImage from "./SearchImage";
import ExpandedPreview from "./ExpandedPreview";

export default function Card({
  item,
  cardType = "",
  isSelected = false,
  onOpen,
}: CardProps & {
  onOpen: (item: any, rect: DOMRect) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const isExpanded = isHovered && !isSelected;

  const handleEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    hoverTimeout.current = setTimeout(() => setIsHovered(true), 600);
  };

  const handleLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (!isSelected) setIsHovered(false);
  };
  
  const handleClick = () => {
    setIsHovered(false);
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    onOpen(item, rect);
  };

  return (
    <div
      ref={cardRef}
      className={`relative flex-none w-[17.8vw] cursor-pointer"}
`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={handleLeave}
    >
      <CardImage item={item} isHovered={isExpanded} onClick={handleClick} />

      <ExpandedPreview
        item={item}
        isHovered={isExpanded}
        isOpen={false}
        cardType={cardType}
        onEnter={() => setIsHovered(true)}
        onLeave={handleLeave}
        onClick={handleClick}
      />
    </div>
  );
}
