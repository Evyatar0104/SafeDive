"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchAndCacheContent, GalleryItem, HappyNewsItem } from "@/lib/offline-storage";
import { ActiveBackground } from "@/components/ui/ActiveBackground";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { logger } from "@/lib/logger";

type Tabs = "gallery" | "news" | "random";

export default function Escapism() {
    const [activeTab, setActiveTab] = useState<Tabs>("gallery");
    const [data, setData] = useState<{ gallery: GalleryItem[]; happy_news: HappyNewsItem[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadContent() {
            try {
                const content = await fetchAndCacheContent();
                setData(content.escapism);
            } catch (error) {
                logger.error("Failed to load escapism content", error);
            } finally {
                setLoading(false);
            }
        }
        loadContent();
    }, []);

    const triggerHaptic = useCallback((style: "light" | "medium" = "light") => {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(style === "light" ? 5 : 10);
        }
    }, []);

    if (loading || !data) {
        return (
            <div className="flex flex-col min-h-[100dvh] items-center justify-center relative">
                <ActiveBackground />
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin relative z-10" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-[100dvh] h-[100dvh] relative overflow-hidden bg-background">
            <ActiveBackground />

            <div className="relative z-20 flex flex-col h-full pointer-events-none">
                <div className="px-4 pt-6 pointer-events-auto shrink-0 transition-opacity duration-300">
                    <PageHeader title="אסקפיזם" />
                </div>

                {/* Segmented Control */}
                <div className="px-4 mb-2 shrink-0 pointer-events-auto">
                    <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl p-1 rounded-full border border-white/20 dark:border-white/5 flex relative shadow-sm">
                        <motion.div
                            className="absolute inset-y-1 rounded-full bg-white dark:bg-white/10 shadow-sm"
                            initial={false}
                            animate={{
                                x: activeTab === "gallery" ? "0%" : activeTab === "news" ? "100%" : "200%",
                                width: "33.33%",
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        <button
                            onClick={() => setActiveTab("gallery")}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold relative z-10 transition-colors duration-200 ${activeTab === "gallery" ? "text-primary dark:text-white" : "text-muted-foreground"
                                }`}
                        >
                            חלון לעולם
                        </button>
                        <button
                            onClick={() => setActiveTab("news")}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold relative z-10 transition-colors duration-200 ${activeTab === "news" ? "text-primary dark:text-white" : "text-muted-foreground"
                                }`}
                        >
                            חיבוק יומי
                        </button>
                        <button
                            onClick={() => setActiveTab("random")}
                            className={`flex-1 py-2 text-xs sm:text-sm font-bold relative z-10 transition-colors duration-200 ${activeTab === "random" ? "text-primary dark:text-white" : "text-muted-foreground"
                                }`}
                        >
                            הפתעה
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 relative pointer-events-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === "gallery" && (
                            <motion.div
                                key="gallery"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0"
                            >
                                <VisualGallery items={data.gallery} onSnap={triggerHaptic} />
                            </motion.div>
                        )}
                        {activeTab === "news" && (
                            <motion.div
                                key="news"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0"
                            >
                                <HappyFeed items={data.happy_news} onSnap={triggerHaptic} />
                            </motion.div>
                        )}
                        {activeTab === "random" && (
                            <motion.div
                                key="random"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="absolute inset-0"
                            >
                                <RandomFeed gallery={data.gallery} news={data.happy_news} onSnap={triggerHaptic} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

        </div>
    );
}

// ----------------------------------------------------------------------
// GALLERY (Horizontal Swipe - Single Active Card)
// ----------------------------------------------------------------------
function VisualGallery({ items, onSnap }: { items: GalleryItem[]; onSnap: () => void }) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x > threshold) {
            setDirection(-1);
            setIndex((prev) => (prev - 1 + items.length) % items.length);
            onSnap();
        } else if (info.offset.x < -threshold) {
            setDirection(1);
            setIndex((prev) => (prev + 1) % items.length);
            onSnap();
        }
    };

    const currentItem = items[index];

    return (
        <div className="w-full h-full relative px-4 pb-8 pt-2 flex flex-col justify-center">
            <div className="relative w-full h-[calc(100vh-180px)] overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={index}
                        custom={direction}
                        variants={{
                            enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0, scale: 0.9 }),
                            center: { x: 0, opacity: 1, scale: 1, zIndex: 1 },
                            exit: (dir: number) => ({ x: dir < 0 ? "100%" : "-100%", opacity: 0, scale: 0.9, zIndex: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 bg-muted cursor-grab active:cursor-grabbing will-change-transform"
                    >
                        <Image
                            src={currentItem.url}
                            alt={currentItem.location}
                            fill
                            className="object-cover pointer-events-none"
                            priority
                            sizes="100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 pointer-events-none">
                            <div dir="rtl" className="text-right">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex items-center gap-2 mb-2"
                                >
                                    <MapPin className="w-4 h-4 text-white/70 flex-shrink-0" />
                                    <span className="text-white/70 text-sm font-medium">{currentItem.country}</span>
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-white text-3xl font-bold"
                                >
                                    {currentItem.location}
                                </motion.h2>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? "w-8 bg-primary" : "w-2 bg-primary/30"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// HAPPY NEWS (Vertical Swipe - Single Active Card)
// ----------------------------------------------------------------------
function HappyFeed({ items, onSnap }: { items: HappyNewsItem[]; onSnap: () => void }) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.y > threshold) {
            setDirection(-1);
            setIndex((prev) => (prev - 1 + items.length) % items.length);
            onSnap();
        } else if (info.offset.y < -threshold) {
            setDirection(1);
            setIndex((prev) => (prev + 1) % items.length);
            onSnap();
        }
    };

    const currentItem = items[index];

    return (
        <div className="w-full h-full relative px-4 pb-8 pt-2 flex flex-col justify-center overflow-hidden">
            <div className="relative w-full max-w-sm mx-auto h-[70vh] max-h-[600px]">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={index}
                        custom={direction}
                        variants={{
                            enter: (dir: number) => ({ y: dir > 0 ? "100%" : "-100%", opacity: 0, scale: 0.95 }),
                            center: { y: 0, opacity: 1, scale: 1, zIndex: 1 },
                            exit: (dir: number) => ({ y: dir < 0 ? "100%" : "-100%", opacity: 0, scale: 0.95, zIndex: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        className="absolute inset-0 bg-white/70 dark:bg-black/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-white/40 dark:border-white/10 flex flex-col cursor-grab active:cursor-grabbing will-change-transform"
                        dir="rtl"
                    >
                        <div className="relative aspect-square w-full shrink-0">
                            <Image
                                src={currentItem.image}
                                alt={currentItem.title}
                                fill
                                className="object-cover pointer-events-none"
                                priority
                                sizes="(max-width: 768px) 100vw, 400px"
                            />
                            {/* Inner gradient shadow for smoother transition to text area */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent dark:from-black/80 dark:via-transparent pointer-events-none" />
                        </div>
                        <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center relative">
                            {/* Decorative accent line */}
                            <div className="absolute top-0 right-8 w-12 h-1 bg-primary rounded-full opacity-60" />
                            <h3 className="text-2xl sm:text-3xl font-black mb-4 mt-2 text-zinc-900 dark:text-zinc-50 leading-tight">
                                {currentItem.title}
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-300 text-lg sm:text-xl leading-relaxed font-medium">
                                {currentItem.fact}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots Vertical Indicator */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-20 pointer-events-none">
                {items.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1.5 rounded-full transition-all duration-300 ${i === index ? "h-6 bg-primary" : "h-1.5 bg-primary/30"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}

// ----------------------------------------------------------------------
// RANDOM FEED (Vertical Swipe - Mixed)
// ----------------------------------------------------------------------
function shuffleArray<T>(array: T[]): T[] {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

type FeedItem =
    | { type: 'gallery'; data: GalleryItem }
    | { type: 'news'; data: HappyNewsItem };

function RandomFeed({ gallery, news, onSnap }: { gallery: GalleryItem[]; news: HappyNewsItem[]; onSnap: () => void }) {
    const [mixedList] = useState<FeedItem[]>(() => {
        const arr1: FeedItem[] = gallery.map(g => ({ type: 'gallery', data: g }));
        const arr2: FeedItem[] = news.map(n => ({ type: 'news', data: n }));
        return shuffleArray([...arr1, ...arr2]);
    });

    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.y > threshold) {
            setDirection(-1);
            setIndex((prev) => (prev - 1 + mixedList.length) % mixedList.length);
            onSnap();
        } else if (info.offset.y < -threshold) {
            setDirection(1);
            setIndex((prev) => (prev + 1) % mixedList.length);
            onSnap();
        }
    };

    const currentItem = mixedList[index];

    return (
        <div className="w-full h-full relative px-4 pb-8 pt-2 flex flex-col justify-center overflow-hidden">
            <div className={`relative w-full ${currentItem.type === 'news' ? 'max-w-sm mx-auto h-[70vh] max-h-[600px]' : 'h-[calc(100vh-180px)]'}`}>
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={index}
                        custom={direction}
                        variants={{
                            enter: (dir: number) => ({ y: dir > 0 ? "100%" : "-100%", opacity: 0, scale: 0.95 }),
                            center: { y: 0, opacity: 1, scale: 1, zIndex: 1 },
                            exit: (dir: number) => ({ y: dir < 0 ? "100%" : "-100%", opacity: 0, scale: 0.95, zIndex: 0 }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        className={`absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border ${currentItem.type === 'news' ? 'border-white/40 dark:border-white/10 flex flex-col' : 'border-white/10 bg-muted'} cursor-grab active:cursor-grabbing will-change-transform`}
                        dir="rtl"
                    >
                        {currentItem.type === 'gallery' ? (
                            <>
                                <Image
                                    src={currentItem.data.url}
                                    alt={currentItem.data.location}
                                    fill
                                    className="object-cover pointer-events-none"
                                    priority
                                    sizes="100vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 pointer-events-none">
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin className="w-4 h-4 text-white/70 flex-shrink-0" />
                                            <span className="text-white/70 text-sm font-medium">{currentItem.data.country}</span>
                                        </div>
                                        <h2 className="text-white text-3xl font-bold">
                                            {currentItem.data.location}
                                        </h2>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="relative aspect-square w-full shrink-0">
                                    <Image
                                        src={currentItem.data.image}
                                        alt={currentItem.data.title}
                                        fill
                                        className="object-cover pointer-events-none"
                                        priority
                                        sizes="(max-width: 768px) 100vw, 400px"
                                    />
                                    {/* Inner gradient shadow for smoother transition to text area */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent dark:from-black/80 dark:via-transparent pointer-events-none" />
                                </div>
                                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center relative bg-white/70 dark:bg-black/60 backdrop-blur-2xl">
                                    {/* Decorative accent line */}
                                    <div className="absolute top-0 right-8 w-12 h-1 bg-primary rounded-full opacity-60" />
                                    <h3 className="text-2xl sm:text-3xl font-black mb-4 mt-2 text-zinc-900 dark:text-zinc-50 leading-tight">
                                        {currentItem.data.title}
                                    </h3>
                                    <p className="text-zinc-600 dark:text-zinc-300 text-lg sm:text-xl leading-relaxed font-medium">
                                        {currentItem.data.fact}
                                    </p>
                                </div>
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Dots Vertical Indicator */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-20 pointer-events-none opacity-50">
                {mixedList.map((_, i) => (
                    <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-300 ${i === index ? "h-3 bg-primary" : "h-1 bg-primary/30"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
