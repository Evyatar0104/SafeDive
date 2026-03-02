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
            <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center h-full">
                <h2 className="text-3xl font-bold">Game Over!</h2>

                <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-muted p-4 rounded-2xl flex flex-col items-center">
                        <Trophy className="text-yellow-500 mb-2 w-8 h-8" />
                        <span className="text-sm text-muted-foreground">Score</span>
                        <span className="text-2xl font-bold">{score}</span>
                    </div>
                    <div className="bg-muted p-4 rounded-2xl flex flex-col items-center">
                        <Flame className="text-orange-500 mb-2 w-8 h-8" />
                        <span className="text-sm text-muted-foreground">Streak</span>
                        <span className="text-2xl font-bold">{streak}</span>
                    </div>
                </div>

                <div className="space-y-2 mt-4 text-muted-foreground">
                    <p>High Score: {Math.max(scores.mathSprint.highScore, score)}</p>
                    <p>Best Streak: {Math.max(scores.mathSprint.bestStreak, streak)}</p>
                </div>

                <button
                    onClick={() => setIsGameOver(false)}
                    className="w-full py-4 mt-4 bg-primary text-primary-foreground font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-5 h-5" /> Play Again
                </button>
            </div>
        );
    }

    if (!isPlaying) {
        return (
            <div className="flex flex-col p-6 space-y-8 h-full">
                <div className="space-y-4">
                    <label className="flex justify-between items-center font-semibold">
                        <span>Difficulty</span>
                        <span className="text-primary">{difficulty}</span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={difficulty}
                        onChange={(e) => setDifficulty(parseInt(e.target.value))}
                        className="w-full accent-primary"
                    />
                    <p className="text-xs text-muted-foreground">
                        {difficulty <= 3 ? "Addition & Subtraction" : difficulty <= 7 ? "Multiplication & Division" : "Advanced Multiplication"}
                    </p>
                </div>

                <div className="space-y-4">
                    <label className="flex justify-between items-center font-semibold">
                        <span>Time Limit</span>
                        <span className="text-primary">{timeLimit}s</span>
                    </label>
                    <input
                        type="range"
                        min="30"
                        max="120"
                        step="15"
                        value={timeLimit}
                        onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                        className="w-full accent-primary"
                    />
                </div>

                <div className="flex-1" />

                <button
                    onClick={startGame}
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <Play className="w-5 h-5" fill="currentColor" /> Start Sprint
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative">
            {/* Header / Timer */}
            <div className="flex items-center justify-between p-6 bg-muted/30 border-b border-muted">
                <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-bold">{score}</span>
                </div>
                <div className="text-3xl font-mono font-bold text-primary">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-bold">{streak}</span>
                    <Flame className="w-5 h-5 text-orange-500" />
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
                    animate={
                        shake ? { x: [-10, 10, -10, 10, 0] } :
                            flashSuccess ? { scale: [1, 1.1, 1] } : {}
                    }
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
            <div className="grid grid-cols-3 gap-2 p-4 bg-muted/20">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleKeypad(num.toString())}
                        className="py-6 text-2xl font-semibold bg-card border border-muted rounded-2xl hover:bg-muted active:scale-95 transition-transform"
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={() => handleKeypad("-")}
                    className="py-6 text-2xl font-semibold bg-card border border-muted rounded-2xl hover:bg-muted active:scale-95 transition-transform flex items-center justify-center font-mono"
                >
                    ±
                </button>
                <button
                    onClick={() => handleKeypad("0")}
                    className="py-6 text-2xl font-semibold bg-card border border-muted rounded-2xl hover:bg-muted active:scale-95 transition-transform flex items-center justify-center font-mono"
                >
                    0
                </button>
                <button
                    onClick={() => handleKeypad("del")}
                    className="py-6 text-2xl font-semibold bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl hover:bg-red-500/20 active:scale-95 transition-transform flex items-center justify-center"
                >
                    <Delete className="w-8 h-8" />
                </button>
            </div>
        </div>
    );
}
