// lib/offline-storage.ts

export interface ContentCache {
    articles: Article[];
    puzzles: Puzzle[];
    escapism: EscapismItem[];
}

export interface Article {
    id: string;
    title: string;
    paragraphs: string[];
    activeMission: string;
}

export interface Puzzle {
    id: string;
    fen: string;
    moves: string[];
    rating: number;
}

export interface EscapismItem {
    id: string;
    title: string;
    imageUrl: string;
    fact: string;
}

// Fallback content in case fetch fails on first load
const FALLBACK_CONTENT: ContentCache = {
    articles: [
        {
            id: "a1",
            title: "החשיבות של נשימה מודעת",
            paragraphs: [
                "נשימה מודעת היא כלי פשוט אך עוצמתי להרגעת מערכת העצבים והפחתת מתח.",
                "כאשר אנו מתמקדים בנשימה שלנו, אנו עוזרים לגוף להאט את קצב הלב ולהוריד את לחץ הדם.",
                "תרגול של דקות ספורות ביום יכול לשפר משמעותית את תחושת הרוגע והיציבות הנפשית."
            ],
            activeMission: "שתפו עם הקרובים לכם טכניקת נשימה אחת שלמדתם היום.",
        },
    ],
    puzzles: [
        {
            id: "p1",
            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
            moves: ["h5f7"],
            rating: 800,
        }
    ],
    escapism: [
        {
            id: "e1",
            title: "ידע נסתר",
            imageUrl: "https://images.unsplash.com/photo-1549488344-c10f844a43b0?auto=format&fit=crop&q=80&w=800",
            fact: "האם ידעתם שדבש לעולם לא מתקלקל? ארכיאולוגים מצאו צנצנות דבש בקברים מצריים בני 3,000 שנה שהיו עדיין אכילות לחלוטין.",
        }
    ]
};

export const CACHE_KEY = "safezone-content-cache";

export async function fetchAndCacheContent(): Promise<ContentCache> {
    // Try to load from local storage first
    if (typeof window !== "undefined") {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            try {
                return JSON.parse(cached) as ContentCache;
            } catch (e) {
                console.error("Failed to parse cached content", e);
            }
        }
    }

    // If online, attempt to fetch fresh content (simulated here)
    try {
        if (typeof navigator !== "undefined" && navigator.onLine) {
            // In a real app we would fetch('/content.json')
            // For MVP, we will just use our defined FALLBACK_CONTENT and store it
            if (typeof window !== "undefined") {
                localStorage.setItem(CACHE_KEY, JSON.stringify(FALLBACK_CONTENT));
            }
            return FALLBACK_CONTENT;
        }
    } catch (error) {
        console.error("Failed to fetch fresh content", error);
    }

    // Final fallback to hardcoded content
    return FALLBACK_CONTENT;
}
