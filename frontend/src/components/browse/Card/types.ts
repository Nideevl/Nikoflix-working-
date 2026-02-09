export type CardItem = {
    content_id: string;
    title: string;
    poster_1?: string;
    poster_2?: string;
    poster_url?: string;
    release_date?: string;
    imdb_rating?: string | number;
    duration_or_episode_count?: string | number;
    genres?: string[];
    type?: "movie" | "series";
};

export type CardProps = {
    item: CardItem;
    cardType?: "First" | "Last" | "";
    className?: string;
    isSelected?: boolean;
    onClick?: () => void;
    onOpen: (item: any, rect: DOMRect) => void;
};