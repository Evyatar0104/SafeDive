"use client";

import { useState } from "react";
import { GameModal } from "@/components/activate-mind/GameModal";
import { MathSprint } from "@/components/activate-mind/MathSprint";
import { ChessPuzzles } from "@/components/activate-mind/ChessPuzzles";
import { MemoryGrid } from "@/components/activate-mind/MemoryGrid";
import { Calculator, Type, Grid3X3, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ActiveBackground } from "@/components/ui/ActiveBackground";

type GameType = "math" | "chess" | "memory" | null;

export default function ActivateMind() {
    const [activeGame, setActiveGame] = useState<GameType>(null);

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground dir-rtl pb-24" dir="rtl">
            <ActiveBackground />

            <div className="px-6 pt-8 w-full max-w-md mx-auto space-y-8 animate-in fade-in duration-700 relative z-10">
                {/* Custom Header Matching Screenshot */}
                <header className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h1 className="text-3xl font-bold tracking-tight">אקטיבציית המוח</h1>
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
                        className="group flex flex-row items-center justify-between p-6 bg-[#1a1a1c] hover:bg-[#222225] rounded-[2.5rem] border border-white/10 transition-colors shadow-lg"
                    >
                        <ArrowRight className="w-6 h-6 text-muted-foreground rotate-180 ml-2" />
                        <div className="flex-1 text-right pr-4 pl-4">
                            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">ספרינט מתמטיקאי</h3>
                            <p className="text-sm text-muted-foreground/90">כמה תרגילים תצליח לפתור בזמן הקצוב?</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-[#202a3b] flex items-center justify-center shrink-0 shadow-inner">
                            <Calculator className="w-8 h-8 text-[#4f8eff]" />
                        </div>
                    </motion.button>

                    {/* Game 2: Chess Puzzles */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveGame("chess")}
                        className="group flex flex-row items-center justify-between p-6 bg-[#1a1a1c] hover:bg-[#222225] rounded-[2.5rem] border border-white/10 transition-colors shadow-lg"
                    >
                        <ArrowRight className="w-6 h-6 text-muted-foreground rotate-180 ml-2" />
                        <div className="flex-1 text-right pr-4 pl-4">
                            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">חידות שחמט</h3>
                            <p className="text-sm text-muted-foreground/90">שפר את החשיבה החדה עם חידות פתע</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-[#1b2c2b] flex items-center justify-center shrink-0 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4fd1c5]"><path d="M12 2v2" /><path d="M10 2l-1 2" /><path d="M14 2l1 2" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /><path d="M2 13a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3z" /><path d="M4 18h16" /><path d="M5 22h14" /></svg>
                        </div>
                    </motion.button>

                    {/* Game 3: Memory Grid */}
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveGame("memory")}
                        className="group flex flex-row items-center justify-between p-6 bg-[#1a1a1c] hover:bg-[#222225] rounded-[2.5rem] border border-white/10 transition-colors shadow-lg"
                    >
                        <ArrowRight className="w-6 h-6 text-muted-foreground rotate-180 ml-2" />
                        <div className="flex-1 text-right pr-4 pl-4">
                            <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">רצף הזיכרון</h3>
                            <p className="text-sm text-muted-foreground/90">חזור על הרצף המהבהב בלי לטעות</p>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-[#2a1c36] flex items-center justify-center shrink-0 shadow-inner">
                            <Grid3X3 className="w-8 h-8 text-[#b85eff]" />
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
