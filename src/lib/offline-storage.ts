// lib/offline-storage.ts
import { logger } from "@/lib/logger";

export interface ContentCache {
    articles: Article[];
    puzzles: Puzzle[];
    escapism: {
        gallery: GalleryItem[];
        happy_news: HappyNewsItem[];
    };
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

export interface GalleryItem {
    id: number;
    url: string;
    location: string;
    country: string;
}

export interface HappyNewsItem {
    id: number;
    image: string;
    title: string;
    fact: string;
}

// ─── Allowed image origins ───────────────────────────────────────────────────
// Only these hosts are permitted inside cached gallery/news image URLs.
const ALLOWED_IMG_HOSTS = [
    "images.unsplash.com",
    "upload.wikimedia.org",
    "image.pollinations.ai",
];

function isSafeUrl(raw: unknown): boolean {
    if (typeof raw !== "string") return false;
    try {
        const parsed = new URL(raw);
        // Only allow https
        if (parsed.protocol !== "https:") return false;
        return ALLOWED_IMG_HOSTS.some((host) => parsed.hostname === host);
    } catch {
        return false;
    }
}

// ─── Runtime validators ───────────────────────────────────────────────────────

function isValidGalleryItem(item: unknown): item is GalleryItem {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;
    return (
        typeof i.id === "number" &&
        typeof i.location === "string" && i.location.length > 0 &&
        typeof i.country === "string" && i.country.length > 0 &&
        isSafeUrl(i.url)
    );
}

function isValidHappyNewsItem(item: unknown): item is HappyNewsItem {
    if (!item || typeof item !== "object") return false;
    const i = item as Record<string, unknown>;
    return (
        typeof i.id === "number" &&
        typeof i.title === "string" && i.title.length > 0 &&
        typeof i.fact === "string" && i.fact.length > 0 &&
        isSafeUrl(i.image)
    );
}

function isValidCache(data: unknown): data is ContentCache {
    if (!data || typeof data !== "object") return false;
    const d = data as Record<string, unknown>;
    if (
        !d.escapism ||
        typeof d.escapism !== "object" ||
        Array.isArray(d.escapism)
    ) return false;

    const esc = d.escapism as Record<string, unknown>;

    if (!Array.isArray(esc.gallery) || esc.gallery.length === 0) return false;
    if (!Array.isArray(esc.happy_news)) return false;

    // Every item must pass the runtime validator — reject if any are malformed.
    if (!esc.gallery.every(isValidGalleryItem)) return false;
    if (!esc.happy_news.every(isValidHappyNewsItem)) return false;

    return true;
}

// ─── Fallback content ─────────────────────────────────────────────────────────
// Fallback content in case fetch fails on first load
const FALLBACK_CONTENT: ContentCache = {
    articles: [
        {
            id: "a1",
            title: "החשיבות של נשימה מודעת",
            paragraphs: [
                "נשימה מודעת היא כלי פשוט אך עוצמתי להרגעת מערכת העצבים והפחתת מתח.",
                "כאשר אנו מתמקדים בנשימה שלנו, אנו עוזרים לגוף להאט את קצב הלב ולהוריד את לחץ הדם.",
                "תרגול של דקות ספורות ביום יכול לשפר משמעותית את תחושת הרוגע והיציבות הנפשית.",
            ],
            activeMission:
                "שתפו עם הקרובים לכם טכניקת נשימה אחת שלמדתם היום.",
        },
    ],
    puzzles: [
        {
            id: "p1",
            fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4",
            moves: ["h5f7"],
            rating: 800,
        },
    ],
    escapism: {
        gallery: [
            {
                id: 1,
                url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800",
                location: "הר מאטרהורן",
                country: "שוויץ",
            },
        ],
        happy_news: [
            {
                id: 1,
                image:
                    "https://images.unsplash.com/photo-1549488344-c10f844a43b0?auto=format&fit=crop&q=80&w=800",
                title: "דבש לעולם לא מתקלקל",
                fact: "האם ידעתם שדבש לעולם לא מתקלקל? ארכיאולוגים מצאו צנצנות דבש בקברים מצריים בני 3,000 שנה שהיו עדיין אכילות לחלוטין.",
            },
        ],
    },
};

export const CACHE_KEY = "safezone-content-cache";

export async function fetchAndCacheContent(): Promise<ContentCache> {
    // Try to load from local storage first
    if (typeof window !== "undefined") {
        const raw = localStorage.getItem(CACHE_KEY);
        if (raw) {
            try {
                const parsed: unknown = JSON.parse(raw);
                if (isValidCache(parsed)) {
                    return parsed;
                }
                // Cache exists but failed validation — clear it and fetch fresh.
                logger.warn("Cached content failed schema validation, fetching fresh content...");
                localStorage.removeItem(CACHE_KEY);
            } catch (e) {
                logger.error("Failed to parse cached content", e);
                localStorage.removeItem(CACHE_KEY);
            }
        }
    }

    // If online, attempt to fetch fresh content
    try {
        if (typeof navigator !== "undefined" && navigator.onLine) {
            const response = await fetch("/escapism.json");
            if (response.ok) {
                const escapismData: unknown = await response.json();
                // Validate the fresh network response before trusting it too.
                if (
                    escapismData &&
                    typeof escapismData === "object" &&
                    !Array.isArray(escapismData)
                ) {
                    const candidate = {
                        ...FALLBACK_CONTENT,
                        escapism: escapismData as ContentCache["escapism"],
                    };
                    if (isValidCache(candidate)) {
                        if (typeof window !== "undefined") {
                            localStorage.setItem(CACHE_KEY, JSON.stringify(candidate));
                        }
                        return candidate;
                    }
                }
                logger.warn("Fetched escapism.json failed validation, using fallback.");
            }
        }
    } catch (error) {
        logger.error("Failed to fetch fresh content", error);
    }

    // Final fallback to hardcoded content
    return FALLBACK_CONTENT;
}

