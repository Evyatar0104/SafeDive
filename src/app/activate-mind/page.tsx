"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { GameModal } from "@/components/activate-mind/GameModal";
import { MathSprint } from "@/components/activate-mind/MathSprint";
import { ChessPuzzles } from "@/components/activate-mind/ChessPuzzles";
import { MemoryGrid } from "@/components/activate-mind/MemoryGrid";
import { Calculator, Grid3X3, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type GameType = "math" | "chess" | "memory" | null;

export default function ActivateMind() {
    const [activeGame, setActiveGame] = useState<GameType>(null);
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = mounted && resolvedTheme === "dark";

    return (
        <div className="flex flex-col min-h-screen text-foreground dir-rtl pb-24 relative overflow-hidden" dir="rtl">
            {/* Animated Dynamic Background - Light Mode Variation included */}
            <div className="fixed inset-0 pointer-events-none z-0 bg-activate-bg transition-colors duration-700">
                {/* Grid Variation */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                    style={{
                        backgroundImage: isDark
                            ? `linear-gradient(to right, rgba(79, 142, 255, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(79, 142, 255, 0.1) 1px, transparent 1px)`
                            : `radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.08) 1.5px, transparent 0)`,
                        backgroundSize: isDark ? '40px 40px' : '24px 24px',
                        maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
                        opacity: 'var(--activate-grid-opacity)'
                    }}
                />

                {/* Floating ambient colored orbs - Dynamic Colors for Variation */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 30, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[100px] transition-colors duration-1000 bg-activate-orb-1"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        x: [0, -40, 0],
                        y: [0, 40, 0],
                    }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] transition-colors duration-1000 bg-activate-orb-2"
                />
            </div>

            <div className="px-6 pt-8 w-full max-w-md mx-auto space-y-8 animate-in fade-in duration-700 relative z-10">
                {/* Custom Header Matching Screenshot */}
                <header className="flex items-center justify-between border-b border-foreground/10 pb-4">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">אקטיבציית המוח</h1>
                    <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground transition-colors active:scale-95">
                        <span className="text-lg font-medium mr-1">חזור</span>
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </Link>
                </header>

                <p className="text-foreground/80 text-center text-lg leading-relaxed px-2">
                    בחר משחק כדי להכניס את הראש לריכוז ולזרימה, להתנתק קצת מהחדשות.
                </p>

                <div className="grid gap-5">
                    {/* Game 1: Math Sprint */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveGame("math")}
                        className="group relative flex flex-row items-center justify-between p-6 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.04] backdrop-blur-xl rounded-[2.5rem] border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_0_rgba(79,142,255,0.1)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <ArrowRight className="w-6 h-6 text-muted-foreground/60 group-hover:text-foreground/80 rotate-180 ml-2 transition-colors relative z-10" />
                        <div className="flex-1 text-right pr-4 pl-4 relative z-10">
                            <h3 className="text-2xl font-bold text-foreground mb-1 tracking-tight drop-shadow-sm">ספרינט מתמטיקאי</h3>
                            <p className="text-sm text-blue-600/70 dark:text-blue-100/60 font-medium">כמה תרגילים תצליח לפתור בזמן הקצוב?</p>
                        </div>
                        <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#202a3b] to-[#141a25] flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.3)] relative z-10 border border-white/5 group-hover:border-[#4f8eff]/30 transition-colors">
                            <Calculator className="w-8 h-8 text-[#4f8eff] drop-shadow-[0_0_12px_rgba(79,142,255,0.6)]" />
                        </div>
                    </motion.button>

                    {/* Game 2: Chess Puzzles */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveGame("chess")}
                        className="group relative flex flex-row items-center justify-between p-6 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.04] backdrop-blur-xl rounded-[2.5rem] border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_0_rgba(79,209,197,0.1)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <ArrowRight className="w-6 h-6 text-muted-foreground/60 group-hover:text-foreground/80 rotate-180 ml-2 transition-colors relative z-10" />
                        <div className="flex-1 text-right pr-4 pl-4 relative z-10">
                            <h3 className="text-2xl font-bold text-foreground mb-1 tracking-tight drop-shadow-sm">חידות שחמט</h3>
                            <p className="text-sm text-teal-600/70 dark:text-teal-100/60 font-medium">שפר את החשיבה החדה עם חידות פתע</p>
                        </div>
                        <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#1b2c2b] to-[#111c1c] flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.3)] relative z-10 border border-white/5 group-hover:border-[#4fd1c5]/30 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#4fd1c5] drop-shadow-[0_0_12px_rgba(79,209,197,0.6)]">
                                <circle cx="12" cy="7" r="3.5" />
                                <path d="M12 10.5v8" />
                                <path d="M8.5 14h7" />
                                <path d="M7 21h10v-2.5H7v2.5z" />
                            </svg>
                        </div>
                    </motion.button>

                    {/* Game 3: Memory Grid */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveGame("memory")}
                        className="group relative flex flex-row items-center justify-between p-6 bg-black/[0.02] dark:bg-white/[0.02] hover:bg-black/[0.05] dark:hover:bg-white/[0.04] backdrop-blur-xl rounded-[2.5rem] border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_0_rgba(184,94,255,0.1)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <ArrowRight className="w-6 h-6 text-muted-foreground/60 group-hover:text-foreground/80 rotate-180 ml-2 transition-colors relative z-10" />
                        <div className="flex-1 text-right pr-4 pl-4 relative z-10">
                            <h3 className="text-2xl font-bold text-foreground mb-1 tracking-tight drop-shadow-sm">רצף הזיכרון</h3>
                            <p className="text-sm text-purple-600/70 dark:text-purple-100/60 font-medium">חזור על הרצף המהבהב בלי לטעות</p>
                        </div>
                        <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-[#2a1c36] to-[#1c1224] flex items-center justify-center shrink-0 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.3)] relative z-10 border border-white/5 group-hover:border-[#b85eff]/30 transition-colors">
                            <Grid3X3 className="w-8 h-8 text-[#b85eff] drop-shadow-[0_0_12px_rgba(184,94,255,0.6)]" />
                        </div>
                    </motion.button>
                </div>
            </div>

            {/* Modals */}
            <GameModal isOpen={activeGame === "math"} onClose={() => setActiveGame(null)} title="ספרינט מתמטיקאי">
                <MathSprint />
            </GameModal>

            <GameModal isOpen={activeGame === "chess"} onClose={() => setActiveGame(null)} title="חידות שחמט">
                <ChessPuzzles />
            </GameModal>

            <GameModal isOpen={activeGame === "memory"} onClose={() => setActiveGame(null)} title="רצף הזיכרון">
                <MemoryGrid />
            </GameModal>
        </div>
    );
}
