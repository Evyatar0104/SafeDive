"use client";

import { TaskCard } from "@/components/ui/TaskCard";
import { Brain, BookOpen, Wind, Palmtree } from "lucide-react";
import { motion } from "framer-motion";
import { ActiveBackground } from "@/components/ui/ActiveBackground";
import { SettingsMenu } from "@/components/ui/SettingsMenu";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full py-0 pt-2 pb-6 space-y-6 relative">
      <ActiveBackground />

      <header className="relative z-20 mb-6 px-6 pt-4 flex flex-col items-center text-center">

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
          <h1 className="flex flex-col items-center justify-center text-[100px] leading-[0.8] font-black tracking-tighter animated-gradient-text drop-shadow-[0_8px_16px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] py-4">
            <span>Safe</span>
            <span>Zone</span>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl font-bold text-foreground/70 tracking-tight max-w-[280px] mx-auto leading-tight mt-6 relative z-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          פעילויות העשרה ורגיעה במרחב המוגן
        </motion.p>
      </header>

      <motion.div
        className="flex flex-col gap-4 w-full px-4 relative z-10"
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
            colorClass="bg-card/30 dark:bg-card/20 text-foreground"
            iconColorClass="bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20"
          />
        </div>

        <div className="w-full">
          <TaskCard
            title="תרגילי נשימה"
            description="טיימר לוויסות נשימה בעת לחץ"
            icon={Wind}
            href="/breathing"
            colorClass="bg-card/30 dark:bg-card/20 text-foreground"
            iconColorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/20"
          />
        </div>

        <div className="w-full">
          <TaskCard
            title="אקטיבציה"
            description="מאגר של פאזלי שחמט וחידות היגיון"
            icon={Brain}
            href="/activate-mind"
            colorClass="bg-card/30 dark:bg-card/20 text-foreground"
            iconColorClass="bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-blue-500/20"
          />
        </div>

        <div className="w-full">
          <TaskCard
            title="אסקפיזם"
            description="עובדות קלילות ונופים מרחבי העולם"
            icon={Palmtree}
            href="/escapism"
            colorClass="bg-card/30 dark:bg-card/20 text-foreground"
            iconColorClass="bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-purple-500/20"
          />
        </div>
      </motion.div>

      <SettingsMenu />
    </div>
  );
}
