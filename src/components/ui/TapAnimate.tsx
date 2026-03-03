"use client";

import { motion } from "framer-motion";

interface TapAnimateProps {
    children: React.ReactNode;
    className?: string;
    scale?: number;
}

export function TapAnimate({ children, className = "", scale = 0.95 }: TapAnimateProps) {
    return (
        <motion.div
            whileTap={{ scale }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
