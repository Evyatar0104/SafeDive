"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { motion, AnimatePresence } from "framer-motion";
import { ActiveBackground } from "@/components/ui/ActiveBackground";
import { Play, Square } from "lucide-react";

type BreathingPhase = "inhale" | "hold1" | "exhale" | "hold2";

const PHASE_DURATIONS = {
    inhale: 4000,
    hold1: 4000,
    exhale: 4000,
    hold2: 4000,
};

const PHASE_LABELS = {
    inhale: "שאיפה...",
    hold1: "להחזיק...",
    exhale: "נשיפה...",
    hold2: "להחזיק...",
};

export default function Breathing() {
    const [phase, setPhase] = useState<BreathingPhase | "idle">("idle");
    const [timer, setTimer] = useState(4);

    useEffect(() => {
        if (phase === "idle") return;

        let duration = PHASE_DURATIONS[phase];
        setTimer(4);
        const interval = setInterval(() => {
            setTimer((t) => (t > 1 ? t - 1 : 4));
        }, 1000);

        const timeout = setTimeout(() => {
            setPhase((prev) => {
                if (prev === "inhale") return "hold1";
                if (prev === "hold1") return "exhale";
                if (prev === "exhale") return "hold2";
                return "inhale";
            });
        }, duration);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [phase]);

    // Enhanced framer motion variants for the breathing rings
    const ringVariants = (layer: number) => ({
        idle: { scale: 0.8 + (layer * 0.15), opacity: 0.15 - (layer * 0.03) },
        inhale: { scale: 1.3 + (layer * 0.4), opacity: 0.4 - (layer * 0.08) },
        hold1: { scale: 1.3 + (layer * 0.4), opacity: 0.4 - (layer * 0.08) },
        exhale: { scale: 0.8 + (layer * 0.15), opacity: 0.15 - (layer * 0.03) },
        hold2: { scale: 0.8 + (layer * 0.15), opacity: 0.15 - (layer * 0.03) },
    });

    return (
        <div className="flex flex-col min-h-screen pb-24 relative overflow-hidden">
            <ActiveBackground />

            <div className="px-4 pt-8 shrink-0 z-20 w-full max-w-md mx-auto">
                <PageHeader title="נשימה" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 z-20 w-full max-w-md mx-auto">
                <div className="w-full h-full max-h-[600px] flex flex-col items-center justify-center p-8 rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-white/10 relative overflow-hidden liquid-glass transition-all duration-500 bg-card/40 dark:bg-card/30">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/5 dark:from-white/10 dark:via-transparent dark:to-transparent pointer-events-none" />

                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-between">
                        {phase === "idle" ? (
                            <div className="text-center space-y-6 flex-1 flex flex-col justify-center animate-in fade-in zoom-in duration-700">
                                <div>
                                    <h2 className="text-4xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-emerald-500 to-emerald-700 drop-shadow-sm mb-4">
                                        נשימת קופסה
                                    </h2>
                                    <p className="text-foreground/80 text-lg leading-relaxed max-w-[260px] mx-auto font-medium">
                                        שיטה פשוטה להורדת מתח והחזרת המיקוד: <br />
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">4</span> שאיפה •{" "}
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">4</span> החזקה •{" "}
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">4</span> נשיפה •{" "}
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">4</span> החזקה
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[300px]">
                                <div className="relative flex flex-col items-center justify-center h-48 w-48 mt-8">
                                    {/* The animated rings */}
                                    {[2, 1, 0].map((layer) => (
                                        <motion.div
                                            key={`ring-${layer}`}
                                            className="absolute inset-0 bg-emerald-500 dark:bg-emerald-400 rounded-full"
                                            style={{ filter: `blur(${layer * 4}px)` }}
                                            variants={ringVariants(layer)}
                                            initial="idle"
                                            animate={phase}
                                            transition={{
                                                duration: 4,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    ))}

                                    <motion.div
                                        className="absolute inset-4 bg-emerald-400 dark:bg-emerald-500 rounded-full shadow-inner z-0 border-2 border-emerald-300/30"
                                        variants={{
                                            idle: { scale: 0.9, opacity: 0.8 },
                                            inhale: { scale: 1, opacity: 1 },
                                            hold1: { scale: 1, opacity: 1 },
                                            exhale: { scale: 0.9, opacity: 0.8 },
                                            hold2: { scale: 0.9, opacity: 0.8 },
                                        }}
                                        initial="idle"
                                        animate={phase}
                                        transition={{
                                            duration: 4,
                                            ease: "easeInOut",
                                        }}
                                    />

                                    {/* The label and counter */}
                                    <div className="relative z-10 text-white text-center drop-shadow-md">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={phase}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -5 }}
                                                transition={{ duration: 0.3 }}
                                                className="font-bold text-2xl mb-1 tracking-wide"
                                            >
                                                {PHASE_LABELS[phase]}
                                            </motion.div>
                                        </AnimatePresence>
                                        <div className="text-6xl font-black tracking-tighter opacity-90 transition-opacity drop-shadow-lg">
                                            {timer}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-12 pb-2 w-full flex justify-center mt-auto">
                            {phase === "idle" ? (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPhase("inhale")}
                                    className="flex items-center gap-3 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold py-4 px-10 rounded-full shadow-[0_8px_30px_rgb(16,185,129,0.3)] transition-all text-xl w-[200px] justify-center"
                                >
                                    <Play className="w-6 h-6 fill-white" />
                                    <span>התחל תרגול</span>
                                </motion.button>
                            ) : (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPhase("idle")}
                                    className="flex items-center gap-2 bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 backdrop-blur-md text-foreground font-semibold py-3 px-8 rounded-full shadow-lg transition-all border border-white/30 dark:border-white/10"
                                >
                                    <Square className="w-5 h-5 fill-current" />
                                    <span>סיים תרגול</span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
