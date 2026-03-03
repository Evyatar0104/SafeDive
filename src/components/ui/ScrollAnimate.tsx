"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollAnimateProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    yOffset?: number;
}

export function ScrollAnimate({ children, className = "", delay = 0, yOffset = 20 }: ScrollAnimateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: yOffset }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.5, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
