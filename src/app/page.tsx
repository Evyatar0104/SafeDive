"use client";

import { TaskCard } from "@/components/ui/TaskCard";
import { Brain, BookOpen, Wind, Palmtree } from "lucide-react";
import { motion } from "framer-motion";
import { ActiveBackground } from "@/components/ui/ActiveBackground";
import { SettingsMenu } from "@/components/ui/SettingsMenu";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-md md:max-w-3xl lg:max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 lg:py-16 space-y-8 relative">
      <ActiveBackground />

      <header className="relative z-20 mb-6 md:mb-10 px-6 pt-4 flex flex-col items-center text-center">

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1,
            ease: "easeOut"
          }}
          className="relative z-10 w-full flex flex-col items-center justify-center"
          dir="ltr"
        >
          <h1 className="flex flex-col items-center justify-center text-[100px] md:text-[80px] lg:text-[90px] leading-[0.8] font-black tracking-tighter text-black dark:text-white py-4 title-depth md:flex-row md:gap-4 md:leading-none">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-white dark:to-gray-300 relative">
              Safe
            </span>
            <span className="text-primary tracking-tight">Zone</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl font-bold text-foreground/70 tracking-tight max-w-[280px] md:max-w-md mx-auto leading-tight mt-6 relative z-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          פעילויות העשרה ורגיעה במרחב המוגן
        </motion.p>
      </header>

      <motion.div
        className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 w-full px-4 md:px-0 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
      >
        <div className="w-full">
          <TaskCard
            title="ידע כללי"
            description="מאמרים קצרים במגוון נושאים עם אופציה למשימות העשרה מעמיקות"
            icon={BookOpen}
            href="/knowledge-lab"
            colorClass="bg-white dark:bg-[#1a1c23]/60 text-foreground border border-black/5 dark:border-white/10"
            iconColorClass="bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_8px_16px_rgba(251,191,36,0.25)]"
          />
        </div>

        <div className="w-full">
          <TaskCard
            title="תרגילי נשימה"
            description="טיימר לוויסות נשימה בעת לחץ"
            icon={Wind}
            href="/breathing"
            colorClass="bg-white dark:bg-[#1a1c23]/60 text-foreground border border-black/5 dark:border-white/10"
            iconColorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_8px_16px_rgba(52,211,153,0.25)]"
          />
        </div>

        <div className="w-full">
          <TaskCard
            title="אקטיבציה"
            description="מאגר של פאזלי שחמט וחידות היגיון"
            icon={Brain}
            href="/activate-mind"
            colorClass="bg-white dark:bg-[#1a1c23]/60 text-foreground border border-black/5 dark:border-white/10"
            iconColorClass="bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_8px_16px_rgba(96,165,250,0.25)]"
          />
        </div>

        <div className="w-full">
          <TaskCard
            title="אסקפיזם"
            description="עובדות קלילות ונופים מרחבי העולם"
            icon={Palmtree}
            href="/escapism"
            colorClass="bg-white dark:bg-[#1a1c23]/60 text-foreground border border-black/5 dark:border-white/10"
            iconColorClass="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-[0_8px_16px_rgba(192,132,252,0.25)]"
          />
        </div>
      </motion.div>

      <SettingsMenu />
    </div>
  );
}
