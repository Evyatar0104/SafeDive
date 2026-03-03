import { useState, useEffect, useCallback, useRef } from "react";
import { useGameScores } from "@/lib/useGameScores";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Trophy, Flame, Delete } from "lucide-react";

export function MathSprint() {
    const { scores, updateScore } = useGameScores();
    const [difficulty, setDifficulty] = useState(5);
    const [timeLimit, setTimeLimit] = useState(60);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);

    // Question state
    const [num1, setNum1] = useState(0);
    const [num2, setNum2] = useState(0);
    const [operator, setOperator] = useState("+");
    const [answer, setAnswer] = useState(0);
    const [userInput, setUserInput] = useState("");
    const [shake, setShake] = useState(false);
    const [flashSuccess, setFlashSuccess] = useState(false);

    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const generateQuestion = useCallback(() => {
        let n1 = 0, n2 = 0, op = "+", ans = 0;

        if (difficulty <= 3) {
            // Addition / Subtraction
            n1 = Math.floor(Math.random() * (difficulty * 10)) + 1;
            n2 = Math.floor(Math.random() * (difficulty * 10)) + 1;
            op = Math.random() > 0.5 ? "+" : "-";
            if (op === "-" && n1 < n2) {
                // Swap to avoid negative for simple levels
                const temp = n1; n1 = n2; n2 = temp;
            }
            ans = op === "+" ? n1 + n2 : n1 - n2;
        } else if (difficulty <= 7) {
            // Multiplication / Division up to 12x12
            op = Math.random() > 0.5 ? "×" : "÷";
            if (op === "×") {
                n1 = Math.floor(Math.random() * 11) + 2;
                n2 = Math.floor(Math.random() * 11) + 2;
                ans = n1 * n2;
            } else {
                n2 = Math.floor(Math.random() * 11) + 2;
                ans = Math.floor(Math.random() * 11) + 2;
                n1 = n2 * ans;
            }
        } else {
            // 2-digit multiplication or complex addition/subtraction
            op = "×";
            n1 = Math.floor(Math.random() * 89) + 11;
            n2 = Math.floor(Math.random() * (difficulty === 10 ? 89 : 9)) + (difficulty === 10 ? 11 : 2);
            ans = n1 * n2;
        }

        setNum1(n1);
        setNum2(n2);
        setOperator(op);
        setAnswer(ans);
        setUserInput("");
    }, [difficulty]);

    const startGame = () => {
        setScore(0);
        setStreak(0);
        setTimeLeft(timeLimit);
        setIsPlaying(true);
        setIsGameOver(false);
        generateQuestion();
    };

    const endGame = useCallback(() => {
        setIsPlaying(false);
        setIsGameOver(true);
        if (timerRef.current) clearInterval(timerRef.current);

        // Save score if better
        if (score > scores.mathSprint.highScore) {
            updateScore("mathSprint", { highScore: score });
        }
        if (streak > scores.mathSprint.bestStreak) {
            updateScore("mathSprint", { bestStreak: streak });
        }
    }, [score, streak, scores.mathSprint, updateScore]);

    useEffect(() => {
        if (isPlaying) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        endGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isPlaying, endGame]);

    useEffect(() => {
        if (!isPlaying || !userInput) return;

        // Auto-check answer if length matches or user presses enter (handled in keypad)
        const parsedInput = parseInt(userInput, 10);

        // If the answer is correct
        if (parsedInput === answer || (userInput === "-0" && answer === 0)) {
            setScore(prev => prev + difficulty * 10);
            setStreak(prev => {
                const newStreak = prev + 1;
                if (newStreak > scores.mathSprint.bestStreak) {
                    updateScore("mathSprint", { bestStreak: newStreak });
                }
                return newStreak;
            });

            // Visual success feedback
            setFlashSuccess(true);
            setTimeout(() => setFlashSuccess(false), 300);

            generateQuestion();
        } else if (userInput.length >= answer.toString().length) {
            // Wrong answer, but reached length
            setShake(true);
            setTimeout(() => setShake(false), 400);
            setStreak(0);
            setUserInput("");
        }
    }, [userInput, answer, difficulty, isPlaying, generateQuestion, scores.mathSprint.bestStreak, updateScore]);

    const handleKeypad = (num: string) => {
        if (num === "del") {
            setUserInput(prev => prev.slice(0, -1));
        } else if (num === "-") {
            if (userInput === "") setUserInput("-");
            else if (userInput.startsWith("-")) setUserInput(userInput.slice(1));
            else setUserInput("-" + userInput);
        } else {
            setUserInput(prev => prev === "0" ? num : prev + num);
        }
    };

    if (isGameOver) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center h-full" dir="rtl">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <Trophy className="text-yellow-500 w-10 h-10 drop-shadow-[0_0_12px_rgba(234,179,8,0.6)]" />
                </div>
                <h2 className="text-4xl font-black tracking-tight text-foreground mb-2">נגמר הזמן!</h2>

                <div className="grid grid-cols-2 gap-4 w-full mt-2">
                    <div className="bg-card border border-black/10 dark:border-white/10 p-5 rounded-3xl flex flex-col items-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        <span className="text-sm text-yellow-500/80 font-bold mb-1 tracking-wider uppercase relative z-10">ניקוד</span>
                        <span className="text-4xl font-black text-foreground drop-shadow-md relative z-10">{score}</span>
                    </div>
                    <div className="bg-card border border-black/10 dark:border-white/10 p-5 rounded-3xl flex flex-col items-center shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -ml-10 -mt-10" />
                        <span className="text-sm text-orange-500/80 font-bold mb-1 tracking-wider uppercase relative z-10">רצף שיא</span>
                        <span className="text-4xl font-black text-foreground drop-shadow-md relative z-10">{streak}</span>
                    </div>
                </div>

                <div className="bg-black/5 dark:bg-white/[0.03] w-full p-5 rounded-[2rem] border border-black/5 dark:border-white/5 space-y-3 mt-6 text-sm font-medium">
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span className="text-base text-foreground/70">שיא ניקוד:</span>
                        <span className="text-lg text-foreground font-black">{Math.max(scores.mathSprint.highScore, score)}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted-foreground">
                        <span className="text-base text-foreground/70">שיא ברצף:</span>
                        <span className="text-lg text-foreground font-black">{Math.max(scores.mathSprint.bestStreak, streak)}</span>
                    </div>
                </div>

                <div className="flex-1" />

                <button
                    onClick={() => setIsGameOver(false)}
                    className="w-full py-5 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/15 text-foreground font-bold rounded-[2rem] active:scale-95 transition-all flex items-center justify-center gap-2 border border-black/10 dark:border-white/10 shadow-sm"
                >
                    <span className="mb-0.5 text-lg">שחק שוב</span>
                    <RotateCcw className="w-5 h-5 ml-1" />
                </button>
            </div>
        );
    }

    if (!isPlaying) {
        return (
            <div className="flex flex-col p-6 space-y-6 h-full text-right" dir="rtl">

                {/* Difficulty Section */}
                <div className="bg-card border border-black/10 dark:border-white/10 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-opacity group-hover:opacity-100 opacity-70" />

                    <div className="flex justify-between items-end mb-5 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">רמת קושי</h3>
                            <p className="text-sm text-muted-foreground/80 font-medium">
                                {difficulty <= 3 ? "חיבור וחיסור (קליל)" : difficulty <= 7 ? "כפל וחילוק (בינוני)" : "כפל מתקדם (קשה)"}
                            </p>
                        </div>
                        <div className="flex items-baseline justify-center w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-inner">
                            <span className="text-2xl font-black text-primary drop-shadow-[0_0_12px_rgba(79,142,255,0.4)] my-auto">{difficulty}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-10 gap-1.5 relative z-10" dir="ltr">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => {
                            const isSelected = difficulty === level;
                            const isPast = level <= difficulty;
                            let colorClass = "bg-black/5 dark:bg-[#2a2a2d] border-transparent";
                            let textClass = "text-muted-foreground/50";

                            if (isPast) {
                                textClass = "text-foreground drop-shadow-sm text-white";
                                if (level <= 3) {
                                    colorClass = "bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] border-emerald-400/50";
                                } else if (level <= 7) {
                                    colorClass = "bg-gradient-to-t from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.4)] border-amber-400/50";
                                } else {
                                    colorClass = "bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.4)] border-rose-400/50";
                                }
                            } else {
                                colorClass = "bg-black/5 dark:bg-[#1f1f22] border border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/20";
                            }

                            return (
                                <button
                                    key={level}
                                    onClick={() => setDifficulty(level)}
                                    className={`col-span-1 h-12 rounded-lg flex items-center justify-center transition-all duration-300 relative overflow-hidden group/btn active:scale-90 border ${colorClass} ${isSelected ? 'scale-110 z-10' : ''}`}
                                >
                                    {isSelected && <div className="absolute inset-0 bg-white/20 rounded-lg animate-pulse" />}
                                    <span className={`relative z-10 text-[11px] sm:text-[13px] font-black font-mono transition-colors ${textClass}`}>
                                        {level}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Limit Section */}
                <div className="bg-card border border-black/10 dark:border-white/10 rounded-3xl p-5 shadow-xl relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none transition-opacity group-hover:opacity-100 opacity-70" />

                    <div className="flex justify-between items-end mb-5 relative z-10">
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">זמן מוקצב</h3>
                            <p className="text-sm text-muted-foreground/80 font-medium">כמה זמן הספרינט יימשך?</p>
                        </div>
                        <div className="flex items-baseline px-3 h-10 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 shadow-inner my-auto">
                            <span className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-300 my-auto">{timeLimit} שניות</span>
                        </div>
                    </div>

                    <div className="flex gap-2 relative z-10 flex-wrap sm:flex-nowrap" dir="ltr">
                        {[30, 45, 60, 90, 120].map(time => {
                            const isSelected = timeLimit === time;
                            return (
                                <button
                                    key={time}
                                    onClick={() => setTimeLimit(time)}
                                    className={`flex-1 min-w-[50px] py-3.5 text-sm font-black rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-1 ${isSelected
                                        ? 'bg-gradient-to-b from-purple-500 to-indigo-600 text-white shadow-[0_4px_20px_rgba(168,85,247,0.4)] border border-purple-400/50 scale-105'
                                        : 'bg-black/5 dark:bg-white/5 text-muted-foreground/80 hover:bg-black/10 hover:text-foreground dark:hover:bg-white/10 border border-black/5 dark:border-white/5 shadow-inner'
                                        }`}
                                >
                                    {time}s
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-1" />

                <button
                    onClick={startGame}
                    className="w-full py-5 bg-gradient-to-r from-primary to-blue-600 hover:from-primary hover:to-primary text-white font-bold rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(79,142,255,0.3)] text-lg h-[72px]"
                >
                    <span className="mb-0.5">התחל ספרינט</span>
                    <Play className="w-5 h-5 ml-1" fill="currentColor" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative font-sans" dir="ltr">
            {/* Header / Timer */}
            <div className="flex items-center justify-between p-6 bg-card/80 backdrop-blur-md border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-inner">
                    <Trophy className="w-5 h-5 text-yellow-500 drop-shadow-md" />
                    <span className="font-black text-xl text-foreground">{score}</span>
                </div>
                <div className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-primary to-foreground dark:from-white dark:to-white/70 drop-shadow-lg">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-4 py-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-inner">
                    <span className="font-black text-xl text-foreground">{streak}</span>
                    <Flame className="w-5 h-5 text-orange-500 drop-shadow-md" />
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-6xl font-bold tracking-tighter">
                <div className="flex items-center gap-4 text-foreground/80">
                    <span>{num1}</span>
                    <span className="text-primary">{operator}</span>
                    <span>{num2}</span>
                </div>
                <motion.div
                    animate={shake ? { x: [-10, 10, -10, 10, 0] } : flashSuccess ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`mt-8 h-20 flex items-center justify-center w-full max-w-[200px] border-b-4 pb-2 transition-colors ${shake ? 'border-red-500 text-red-500' :
                        flashSuccess ? 'border-green-500 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]' :
                            'border-primary text-foreground'
                        }`}
                >
                    {userInput || <span className="text-muted-foreground/30">?</span>}
                </motion.div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 p-4 bg-card/80 backdrop-blur-md border-t border-black/5 dark:border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleKeypad(num.toString())}
                        className="py-6 text-2xl font-black bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-foreground shadow-inner"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={() => handleKeypad("-")}
                    className="py-6 text-2xl font-black bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center font-mono text-foreground/70 shadow-inner"
                >
                    ±
                </button>
                <button
                    onClick={() => handleKeypad("0")}
                    className="py-6 text-2xl font-black bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center font-mono text-foreground shadow-inner"
                >
                    0
                </button>
                <button
                    onClick={() => handleKeypad("del")}
                    className="py-6 text-2xl font-black bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 rounded-2xl hover:bg-red-500/20 active:scale-95 transition-all flex items-center justify-center shadow-inner"
                >
                    <Delete className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
}
