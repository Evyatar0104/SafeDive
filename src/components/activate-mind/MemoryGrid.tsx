import { useState, useEffect, useCallback, useRef } from "react";
import { useGameScores } from "@/lib/useGameScores";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, Flame } from "lucide-react";

type Phase = "idle" | "flash" | "input" | "gameover";

export function MemoryGrid() {
    const { scores, updateScore } = useGameScores();
    const [difficulty, setDifficulty] = useState(1);
    const [phase, setPhase] = useState<Phase>("idle");
    const [streak, setStreak] = useState(0);

    // Grid setup
    const gridSize = Math.min(6, Math.max(3, Math.floor(difficulty / 2) + 2)); // Diff 1-2: 3x3, 3-4: 4x4, 5-6: 5x5, 7-10: 6x6
    const totalCells = gridSize * gridSize;

    const [sequence, setSequence] = useState<number[]>([]);
    const [userProgress, setUserProgress] = useState(0);
    const [flashIndex, setFlashIndex] = useState(-1);

    const flashTimer = useRef<NodeJS.Timeout | null>(null);

    const generateSequence = useCallback((currentStreak: number, currentDifficulty: number) => {
        // Number of cells to flash depends on difficulty and streak
        const baseCells = Math.min(7, 2 + Math.floor(currentDifficulty / 2));
        const additionalForStreak = Math.floor(currentStreak / 3);
        const seqLength = Math.min(totalCells - 1, baseCells + additionalForStreak);

        const newSequence: number[] = [];
        // Sequential unique cells
        const available = Array.from({ length: totalCells }, (_, i) => i);

        for (let i = 0; i < seqLength; i++) {
            const rIndex = Math.floor(Math.random() * available.length);
            newSequence.push(available[rIndex]);
            available.splice(rIndex, 1);
        }

        setSequence(newSequence);
        setUserProgress(0);
        return newSequence;
    }, [totalCells]);

    const startRound = useCallback((currentStreak: number) => {
        const seq = generateSequence(currentStreak, difficulty);
        setPhase("flash");
        setFlashIndex(-1);

        // Show sequence sequentially
        let i = 0;
        const speed = Math.max(300, 800 - (difficulty * 50) - (currentStreak * 20)); // Faster as you go

        const showNext = () => {
            if (i < seq.length) {
                setFlashIndex(seq[i]);
                i++;
                flashTimer.current = setTimeout(() => {
                    setFlashIndex(-1); // turn off briefly
                    flashTimer.current = setTimeout(showNext, 150);
                }, speed);
            } else {
                setFlashIndex(-1);
                setPhase("input");
            }
        };

        flashTimer.current = setTimeout(showNext, 1000); // 1s pause before flashing starts
    }, [difficulty, generateSequence]);

    const startGame = () => {
        setStreak(0);
        startRound(0);
    };

    const endGame = useCallback(() => {
        setPhase("gameover");
        if (streak > scores.memoryGrid.longestStreak) {
            updateScore("memoryGrid", { longestStreak: streak });
        }
    }, [streak, scores.memoryGrid, updateScore]);

    const handleCellClick = (index: number) => {
        if (phase !== "input") return;

        const expectedIndex = sequence[userProgress];

        if (index === expectedIndex) {
            // Correct cell
            const newProgress = userProgress + 1;
            setUserProgress(newProgress);

            // Brief visual feedback using a momentary flash state? For now, button animation is enough

            if (newProgress === sequence.length) {
                // Round complete
                const newStreak = streak + 1;
                setStreak(newStreak);
                if (newStreak > scores.memoryGrid.longestStreak) {
                    updateScore("memoryGrid", { longestStreak: newStreak });
                }
                setTimeout(() => startRound(newStreak), 1000);
            }
        } else {
            // Wrong cell
            endGame();
        }
    };

    useEffect(() => {
        return () => {
            if (flashTimer.current) clearTimeout(flashTimer.current);
        };
    }, []);

    if (phase === "idle") {
        return (
            <div className="flex flex-col p-6 space-y-8 h-full">
                <div className="space-y-4">
                    <label className="flex justify-between items-center font-semibold">
                        <span>Difficulty Level</span>
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
                        Higher difficulty means larger grids ({gridSize}x{gridSize}) and faster flashes.
                    </p>
                </div>

                <div className="flex-1" />

                <button
                    onClick={startGame}
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <Play className="w-5 h-5" fill="currentColor" /> Start Memory
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-orange-500" />
                    <span className="font-bold text-xl">{streak}</span>
                </div>

                <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${phase === "flash" ? "bg-blue-500/20 text-blue-500" : phase === "input" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                    {phase === "flash" ? "Watch carefully..." : phase === "input" ? "Your turn!" : "Game Over"}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 flex items-center justify-center w-full">
                <div
                    className="grid gap-2 w-full max-w-[400px] aspect-square"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: totalCells }).map((_, i) => {
                        const isFlash = flashIndex === i;
                        const isCorrectlyGuessed = phase === "input" && sequence.indexOf(i) !== -1 && sequence.indexOf(i) < userProgress;

                        let cellClass = "bg-muted hover:bg-muted/80 border border-muted-foreground/10";
                        if (isFlash) {
                            cellClass = "bg-primary border-primary shadow-[0_0_15px_rgba(0,122,255,0.5)] scale-105 z-10";
                        } else if (isCorrectlyGuessed) {
                            cellClass = "bg-green-500/50 border-green-500 border bg-opacity-50";
                        }

                        return (
                            <button
                                key={i}
                                disabled={phase !== "input"}
                                onClick={() => handleCellClick(i)}
                                className={`rounded-xl transition-all duration-200 active:scale-95 ${cellClass}`}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Game Over Screen */}
            <AnimatePresence>
                {phase === "gameover" && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md flex flex-col justify-center items-center z-20 m-[-1.5rem]"
                    >
                        <div className="bg-card p-8 rounded-3xl border border-muted flex flex-col items-center space-y-6 text-center max-w-sm w-full mx-4 shadow-2xl">
                            <h2 className="text-3xl font-bold">Oops!</h2>
                            <p className="text-lg text-muted-foreground">
                                Wrong cell.
                            </p>

                            <div className="bg-muted p-6 rounded-2xl flex flex-col items-center w-full">
                                <Flame className="text-orange-500 mb-2 w-10 h-10" />
                                <span className="text-sm text-muted-foreground uppercase tracking-wider">Final Streak</span>
                                <span className="text-4xl font-bold">{streak}</span>
                            </div>

                            <p className="text-sm text-muted-foreground">Longest Streak: {scores.memoryGrid.longestStreak}</p>

                            <button
                                onClick={() => setPhase("idle")}
                                className="w-full py-4 mt-2 bg-primary text-primary-foreground font-bold rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-5 h-5" /> Back to Menu
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
