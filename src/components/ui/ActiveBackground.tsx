"use client";

import { motion } from "framer-motion";

export function ActiveBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, 0],
                    y: [0, 30, 0],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] rounded-full bg-blue-500/40 dark:bg-blue-600/30 blur-[100px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, 60, 0],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
                className="absolute top-[10%] right-[-20%] w-[80vw] h-[80vw] rounded-full bg-sky-500/30 dark:bg-sky-600/30 blur-[120px]"
            />
            <motion.div
                animate={{
                    scale: [1, 1.1, 1],
                    x: [0, 30, 0],
                    y: [0, -50, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 5,
                }}
                className="absolute bottom-[-10%] left-[10%] w-[75vw] h-[75vw] rounded-full bg-blue-400/30 dark:bg-blue-500/20 blur-[100px]"
            />
            {/* Background overlay for blending - further reduced for vibrancy */}
            <div className="absolute inset-0 bg-background/20 backdrop-blur-[20px] dark:backdrop-blur-[40px]" />
        </div>
    );
}
