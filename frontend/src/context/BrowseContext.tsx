"use client";

import { createContext, useContext, useState, useRef, ReactNode } from "react";
import { CardItem } from "@/components/browse/Card/types";

type Row = {
  title: string;
  content: any[];
};

type BillboardContent = {
  content_id: string;
  title: string;
  description: string;
  backdrop?: string;
  poster_1?: string;
  poster_2?: string;
  ingest_status?: string;
  movie_or_episode_id?: string;
  type?: string;
};

type BrowseContextType = {
  // 🎬 Browse state
  rows: Row[];
  setRows: (rows: Row[]) => void;
  browseScrollY: number;
  setBrowseScrollY: (y: number) => void;
  
  // 🎪 Billboard state
  billboardItems: BillboardContent[];
  setBillboardItems: (items: BillboardContent[]) => void;
  billboardActiveIndex: number;
  setBillboardActiveIndex: (index: number) => void;
  
  // 🔍 Search state
  searchResults: CardItem[];
  setSearchResults: (results: CardItem[]) => void;
  searchLoading: boolean;
  setSearchLoading: (loading: boolean) => void;
  
  // 🎭 Modal state
  expandedItem: CardItem | null;
  setExpandedItem: (item: CardItem | null) => void;
  originRect: DOMRect | null;
  setOriginRect: (rect: DOMRect | null) => void;
  modalScrollY: number;
  setModalScrollY: (y: number) => void;
  
  // 🔒 Initialization
  hasInitialized: React.MutableRefObject<boolean>;
};

const BrowseContext = createContext<BrowseContextType | null>(null);

export function BrowseProvider({ children }: { children: ReactNode }) {
  // 🎬 Browse state (persisted across route changes)
  const [rows, setRows] = useState<Row[]>([]);
  const [browseScrollY, setBrowseScrollY] = useState(0);
  
  // 🎪 Billboard state (persisted across route changes)
  const [billboardItems, setBillboardItems] = useState<BillboardContent[]>([]);
  const [billboardActiveIndex, setBillboardActiveIndex] = useState(0);
  
  // 🔍 Search state (persisted across route changes)
  const [searchResults, setSearchResults] = useState<CardItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // 🎭 Modal state (shared between both views)
  const [expandedItem, setExpandedItem] = useState<CardItem | null>(null);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [modalScrollY, setModalScrollY] = useState(0);
  
  // 🔒 Prevent fetch loops
  const hasInitialized = useRef(false);

  return (
    <BrowseContext.Provider
      value={{
        rows,
        setRows,
        browseScrollY,
        setBrowseScrollY,
        billboardItems,
        setBillboardItems,
        billboardActiveIndex,
        setBillboardActiveIndex,
        searchResults,
        setSearchResults,
        searchLoading,
        setSearchLoading,
        expandedItem,
        setExpandedItem,
        originRect,
        setOriginRect,
        modalScrollY,
        setModalScrollY,
        hasInitialized,
      }}
    >
      {children}
    </BrowseContext.Provider>
  );
}

export function useBrowseContext() {
  const context = useContext(BrowseContext);
  if (!context) {
    throw new Error("useBrowseContext must be used within BrowseProvider");
  }
  return context;
}