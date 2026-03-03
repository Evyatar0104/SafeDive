"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCardProps {
    title: string;
    description?: string;
    icon: LucideIcon;
    href: string;
    colorClass?: string;
    iconColorClass?: string;
    size?: "default" | "large";
}

export function TaskCard({
    title,
    description,
    icon: Icon,
    href,
    colorClass = "bg-card/40 dark:bg-card/30 text-card-foreground",
    iconColorClass = "bg-black/5 dark:bg-white/10",
    size = "default"
}: TaskCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="h-full w-full"
        >
            <Link href={href} className="block w-full h-full outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-[2rem]">
                <div
                    className={`flex flex-col p-5 h-full gap-3 rounded-[2rem] shadow-[0_16px_48px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/10 dark:border-white/10 relative overflow-hidden bg-white/80 dark:bg-[#1a1c23]/80 backdrop-blur-[40px] saturate-150 transition-all duration-300 ${colorClass}`}
                >
                    {/* Add a subtle highlight for glass reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-black/5 dark:from-white/10 dark:via-transparent dark:to-transparent pointer-events-none" />

                    <div className="flex items-center justify-between gap-4 relative z-10 w-full">
                        <h2 className="text-3xl font-bold tracking-tight leading-none text-foreground">{title}</h2>
                        <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${iconColorClass}`}>
                            <Icon className="w-8 h-8" strokeWidth={2.5} />
                        </div>
                    </div>

                    {description && (
                        <p className="text-lg text-foreground/80 leading-snug font-medium relative z-10 text-right w-full">{description}</p>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
