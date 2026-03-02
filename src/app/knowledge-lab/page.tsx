"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Article, allArticles } from "@/data/articles";
import { ChevronRight, ChevronLeft, Sparkles, Share2 } from "lucide-react";
import Link from "next/link";
import { ActiveBackground } from "@/components/ui/ActiveBackground";

export default function KnowledgeLab() {
    // Navigation & Data State
    const [history, setHistory] = useState<Article[]>([]);
    const [unseenArticles, setUnseenArticles] = useState<Article[]>([]);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [nextArticle, setNextArticle] = useState<Article | null>(null);

    // Direction for animation
    const [direction, setDirection] = useState<"forward" | "backward">("forward");

    const pickRandom = (pool: Article[]) => {
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    };

    useEffect(() => {
        // Start flow IMMEDIATELY with a random article when loading the page
        let remaining = [...allArticles];
        const initialArticle = pickRandom(remaining);

        if (initialArticle) {
            remaining = remaining.filter(a => a.id !== initialArticle.id);
            setCurrentArticle(initialArticle);

            const upcoming = pickRandom(remaining);
            if (upcoming) {
                remaining = remaining.filter(a => a.id !== upcoming.id);
                setNextArticle(upcoming);
            }
            setUnseenArticles(remaining);
        }
    }, []);

    const handleNext = () => {
        if (!currentArticle || !nextArticle) return;
        window.scrollTo({ top: 0, behavior: "smooth" });
        setDirection("forward");
        setHistory(prev => [...prev, currentArticle]);
        setCurrentArticle(nextArticle);

        let pool = [...unseenArticles];
        if (pool.length === 0) {
            pool = allArticles.filter(a => a.id !== nextArticle.id);
        }
        const newUpcoming = pickRandom(pool);
        if (newUpcoming) {
            setUnseenArticles(pool.filter(a => a.id !== newUpcoming.id));
            setNextArticle(newUpcoming);
        }
    };

    const handleBack = () => {
        if (history.length === 0) return;
        window.scrollTo({ top: 0, behavior: "smooth" });
        setDirection("backward");

        const previousHistory = [...history];
        const targetArticle = previousHistory.pop();

        if (targetArticle && currentArticle) {
            setNextArticle(currentArticle);
            setCurrentArticle(targetArticle);
            setHistory(previousHistory);
        }
    };

    const handleShare = async (article: Article) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: article.title,
                    text: article.share_template,
                    url: window.location.href,
                });
            } catch (err) { }
        } else {
            navigator.clipboard.writeText(article.share_template);
            alert("הטקסט הועתק ללוח!");
        }
    };

    const variants = {
        enter: (dir: "forward" | "backward") => ({
            x: dir === "forward" ? -50 : 50,
            opacity: 0,
            filter: "blur(10px)",
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            filter: "blur(0px)",
        },
        exit: (dir: "forward" | "backward") => ({
            zIndex: 0,
            x: dir === "forward" ? 50 : -50,
            opacity: 0,
            filter: "blur(10px)",
        })
    };

    return (
        <div className="flex flex-col min-h-[100dvh] relative overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
            <ActiveBackground />

            {currentArticle ? (
                <>
                    <main className="relative z-10 flex-1 flex flex-col pt-safe px-4 pb-48">
                        <AnimatePresence mode="wait" custom={direction} initial={false}>
                            <motion.article
                                key={currentArticle.id}
                                custom={direction}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: "spring", stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                    filter: { duration: 0.2 }
                                }}
                                className="flex flex-col gap-6 w-full max-w-md mx-auto mt-6"
                            >
                                {/* Header Area */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase border border-primary/20 shadow-sm">
                                            {currentArticle.category}
                                        </span>
                                        <button onClick={() => handleShare(currentArticle)} className="p-2 rounded-full bg-card hover:bg-card/80 text-primary transition-colors border border-white/5 shadow-sm">
                                            <Share2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight">
                                        {currentArticle.title}
                                    </h1>

                                    {/* Related Header Image (Uses Pollinations AI text-to-image to generate a related stock photo) */}
                                    <div className="w-full aspect-video rounded-3xl bg-card border border-white/10 dark:border-white/5 shadow-inner overflow-hidden flex items-center justify-center relative group">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 mix-blend-multiply" />
                                        <img
                                            src={currentArticle.image_url}
                                            alt={currentArticle.title}
                                            className="w-full h-full object-cover relative z-0 bg-card/40"
                                        />
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="prose prose-zinc dark:prose-invert max-w-none 
                    prose-p:leading-relaxed prose-p:text-[1.1rem] prose-p:font-medium text-foreground/90">
                                    {currentArticle.article_body.split('\n').map((paragraph, i) => (
                                        <p key={i} className="mb-5 last:mb-0" dangerouslySetInnerHTML={{
                                            __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
                                        }} />
                                    ))}
                                </div>

                                {/* Active Mission */}
                                <div className="mt-2 p-6 rounded-[2rem] bg-gradient-to-br from-indigo-50/50 to-primary/5 dark:from-indigo-900/20 dark:to-primary/10 border border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden group">
                                    <div className="absolute top-[-20%] right-[-10%] opacity-10 drop-shadow-2xl transition-transform group-hover:scale-110">
                                        <Sparkles className="w-40 h-40 text-primary" />
                                    </div>

                                    <h3 className="text-2xl font-black text-primary mb-4 flex items-center gap-2 relative z-10">
                                        <Sparkles className="w-6 h-6 flex-shrink-0" />
                                        המשימה
                                    </h3>
                                    <div className="space-y-4 relative z-10">
                                        <h4 className="font-bold text-foreground text-lg">{currentArticle.active_mission.title}</h4>
                                        <p className="text-foreground/80 whitespace-pre-wrap leading-relaxed font-medium">
                                            {currentArticle.active_mission.description}
                                        </p>
                                        <div className="mt-4 p-4 bg-background/60 rounded-2xl text-sm font-bold text-foreground/80 border border-foreground/5 dark:border-white/10 flex items-start gap-3 shadow-inner">
                                            <span className="text-primary flex-shrink-0 text-lg">🎯</span>
                                            <span className="leading-snug">{currentArticle.active_mission.output_goal}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Teaser for next */}
                                {nextArticle && (
                                    <button
                                        onClick={handleNext}
                                        className="mt-6 mb-4 w-full text-right p-5 rounded-3xl bg-card border border-foreground/5 dark:border-white/5 shadow-md hover:shadow-lg transition-all active:scale-[0.98] group flex justify-between items-center"
                                    >
                                        <div className="flex flex-col pr-2 gap-1">
                                            <span className="text-xs text-primary font-bold tracking-wider uppercase">הבא בתור</span>
                                            <span className="font-bold text-foreground text-lg leading-tight line-clamp-1">{nextArticle.title}</span>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                                            <ChevronLeft className="w-6 h-6" />
                                        </div>
                                    </button>
                                )}
                            </motion.article>
                        </AnimatePresence>
                    </main>

                    {/* Sticky Glass Footer - Using Solid Card Blur for contrast against active background */}
                    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-[max(env(safe-area-inset-bottom),_2rem)] pt-6 bg-card/90 backdrop-blur-3xl border-t border-white/10 shadow-[0_-20px_40px_rgba(0,0,0,0.25)]">
                        <div className="max-w-md mx-auto flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-3 px-2">
                                <button
                                    onClick={handleBack}
                                    disabled={history.length === 0}
                                    className="flex justify-center items-center w-14 h-14 rounded-full bg-black/5 dark:bg-white/10 text-foreground hover:bg-black/10 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.94] shadow-sm border border-foreground/5 dark:border-white/10"
                                    aria-label="Previous article"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="flex-1 flex items-center justify-center gap-2 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] border border-blue-400/30"
                                >
                                    מאמר הבא
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex justify-center mt-1">
                                <Link href="/" className="text-xs font-bold text-foreground/50 hover:text-foreground/80 transition-colors uppercase tracking-widest px-4 py-2">
                                    חזרה למסך הבית
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="min-h-screen flex items-center justify-center relative z-10">
                    <span className="text-primary font-bold">טוען ידע...</span>
                </div>
            )}
        </div>
    );
}
