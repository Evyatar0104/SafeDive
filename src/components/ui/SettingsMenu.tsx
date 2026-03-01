"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Moon, Sun, Monitor } from "lucide-react";

export function SettingsMenu() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-full mt-6 px-4 pb-8">
                <div className="w-full bg-card/30 dark:bg-card/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 liquid-glass">
                    <div className="text-sm font-bold text-foreground/80 mb-3 text-right">הגדרות תצוגה</div>
                    <div className="grid grid-cols-3 gap-2 opacity-0">
                        <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl"></div>
                        <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl"></div>
                        <div className="h-10 bg-black/5 dark:bg-white/5 rounded-xl"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full mt-6 px-4 pb-8">
            <div className="w-full bg-card/30 dark:bg-card/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-4 liquid-glass">
                <div className="text-sm font-bold text-foreground/80 mb-3 text-right">הגדרות תצוגה</div>
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all ${theme === "light" ? "bg-primary text-primary-foreground shadow-md" : "bg-black/5 dark:bg-white/5 text-foreground/70"}`}
                    >
                        <Sun className="w-5 h-5" />
                        <span className="text-[10px] font-bold">בהיר</span>
                    </button>
                    <button
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all ${theme === "dark" ? "bg-primary text-primary-foreground shadow-md" : "bg-black/5 dark:bg-white/5 text-foreground/70"}`}
                    >
                        <Moon className="w-5 h-5" />
                        <span className="text-[10px] font-bold">כהה</span>
                    </button>
                    <button
                        onClick={() => setTheme("system")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all ${theme === "system" ? "bg-primary text-primary-foreground shadow-md" : "bg-black/5 dark:bg-white/5 text-foreground/70"}`}
                    >
                        <Monitor className="w-5 h-5" />
                        <span className="text-[10px] font-bold">מערכת</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
