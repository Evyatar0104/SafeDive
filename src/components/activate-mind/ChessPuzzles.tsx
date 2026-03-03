"use client";

import { useState, useEffect, useCallback } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Eye, RefreshCw, Trophy, Zap } from "lucide-react";
import { logger } from "@/lib/logger";

interface PuzzleData {
    id: string;
    fen: string;
    moves: string[];
    rating: number;
    themes: string[];
}

export function ChessPuzzles() {
    const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
    const [game, setGame] = useState<Chess>(new Chess());
    const [moveIndex, setMoveIndex] = useState(0);
    const [status, setStatus] = useState<"playing" | "solved" | "failed" | "illegal">("playing");
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<PuzzleData[]>([]);
    const [difficulty, setDifficulty] = useState<"all" | "easy" | "medium" | "hard" | "extreme">("all");
    const [isDifficultyMenuOpen, setIsDifficultyMenuOpen] = useState(false);

    // Interactive Highlights
    const [moveSquares, setMoveSquares] = useState<{ [square: string]: { background: string; borderRadius?: string } }>({});
    const [optionSquares, setOptionSquares] = useState<{ [square: string]: { background: string; borderRadius?: string } }>({});
    const [rightClickedSquares, setRightClickedSquares] = useState<{ [square: string]: { backgroundColor: string } }>({});

    const loadPuzzle = useCallback(async (existingData?: PuzzleData, overrideDifficulty?: string) => {
        setLoading(true);
        try {
            let data = existingData;
            if (!data) {
                const fetchDiff = overrideDifficulty || difficulty;
                const res = await fetch(`/api/chess-puzzle?difficulty=${fetchDiff}`);
                data = await res.json();
            }

            if (data) {
                const newGame = new Chess(data.fen);
                setGame(newGame);
                setPuzzle(data);
                setMoveIndex(1); // Player will start at index 1
                setStatus("playing");

                if (!existingData) {
                    setHistory(prev => [...prev, data]);
                }

                // Auto-play the opponent's first move (the blunder that sets up the puzzle)
                setTimeout(() => {
                    const oppTest = new Chess(data.fen);
                    const firstMoveUci = data.moves[0];
                    if (firstMoveUci) {
                        const from = firstMoveUci.slice(0, 2);
                        const to = firstMoveUci.slice(2, 4);
                        const prom = firstMoveUci.length > 4 ? firstMoveUci[4] : undefined;

                        oppTest.move({ from, to, promotion: prom });
                        setGame(oppTest);
                    }
                }, 600);
            }
        } catch (e) {
            logger.error("Failed to load chess puzzle:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPuzzle();
    }, [loadPuzzle]);

    // Clear highlights on state changes
    useEffect(() => {
        if (status !== "playing") {
            setOptionSquares({});
            setRightClickedSquares({});
        }
    }, [status]);

    const getMoveOptions = (square: string) => {
        const moves = game.moves({
            square: square as any,
            verbose: true,
        });

        if (moves.length === 0) {
            setOptionSquares({});
            return false;
        }

        const newSquares: { [square: string]: { background: string; borderRadius?: string } } = {};
        moves.map((move) => {
            const isCapture = game.get(move.to as any) && game.get(move.to as any)?.color !== game.get(square as any)?.color;
            newSquares[move.to] = {
                background: isCapture
                    ? "radial-gradient(circle, rgba(0,0,0,.3) 85%, transparent 85%)"
                    : "radial-gradient(circle, rgba(0,0,0,.25) 25%, transparent 25%)",
                borderRadius: "50%",
            };
            return move;
        });

        newSquares[square] = {
            background: "rgba(255, 255, 0, 0.4)",
        };

        setOptionSquares(newSquares);
        return true;
    };

    const onSquareClick = (square: string) => {
        if (status !== "playing") return;

        setRightClickedSquares({});

        // If clicking on an option square (making a move)
        if (optionSquares[square]) {
            // Find the source square
            const sourceSquare = Object.keys(optionSquares).find(
                (s) => optionSquares[s].background === "rgba(255, 255, 0, 0.4)"
            );

            if (sourceSquare) {
                // Try moving. For simplicity, we just use a default piece string like 'wp' since onDrop needs it, 
                // but we can just call our onDrop logic.
                const piece = game.get(sourceSquare as any);
                if (piece) {
                    onDrop(sourceSquare, square, `${piece.color}${piece.type}`);
                }
            }
            return;
        }

        // Otherwise generate options
        getMoveOptions(square);
    };

    const onPieceClick = (piece: string, square: string) => {
        if (status !== "playing") return;
        setRightClickedSquares({});
        getMoveOptions(square);
    };

    const onPieceDragBegin = (piece: string, sourceSquare: string) => {
        if (status !== "playing") return;
        setRightClickedSquares({});
        getMoveOptions(sourceSquare);
    };

    const onDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
        setOptionSquares({});
        if (status !== "playing" || !puzzle) return false;

        // Check if the move is legal in chess.js
        const move = {
            from: sourceSquare,
            to: targetSquare,
            promotion: piece[1].toLowerCase() ?? "q",
        };

        try {
            // Validate move purely in chess terms first
            const testGame = new Chess(game.fen());
            const rawMove = testGame.move(move);

            if (!rawMove) {
                setStatus("illegal");
                setTimeout(() => setStatus(s => s === "illegal" ? "playing" : s), 800);
                return false;
            }

            // Validate against puzzle solution
            const expectedMoveUci = puzzle.moves[moveIndex];
            const selectedMoveUci = sourceSquare + targetSquare + (rawMove.promotion ? rawMove.promotion : "");

            if (selectedMoveUci === expectedMoveUci || selectedMoveUci === expectedMoveUci.slice(0, 4)) {
                // Correct move
                const newGame = new Chess(game.fen());
                newGame.move(move);
                setGame(newGame);

                if (moveIndex + 1 >= puzzle.moves.length) {
                    // Puzzle solved!
                    setStatus("solved");
                    setMoveIndex(prev => prev + 1);
                } else {
                    // Opponent's turn
                    setMoveIndex(prev => prev + 1);
                    setStatus("playing");

                    // Auto-play opponent's response after a tiny delay
                    setTimeout(() => {
                        const oppTest = new Chess(newGame.fen());
                        const nextMoveUci = puzzle.moves[moveIndex + 1];
                        const from = nextMoveUci.slice(0, 2);
                        const to = nextMoveUci.slice(2, 4);
                        const prom = nextMoveUci.length > 4 ? nextMoveUci[4] : undefined;

                        oppTest.move({ from, to, promotion: prom });
                        setGame(oppTest);
                        setMoveIndex(prev => prev + 1);

                        if (moveIndex + 2 >= puzzle.moves.length) {
                            setStatus("solved");
                        }
                    }, 500);
                }
                return true;
            } else {
                // Incorrect move
                setStatus("failed");
                setTimeout(() => setStatus(s => s === "failed" ? "playing" : s), 800);
                return false;
            }

        } catch (error) {
            setStatus("illegal");
            setTimeout(() => setStatus(s => s === "illegal" ? "playing" : s), 800);
            return false; // Illegal move exception
        }
    };

    const showSolution = () => {
        if (!puzzle) return;
        setStatus("solved");

        // Animate the rest of the moves
        let currentFen = new Chess(game.fen());
        let currentIdx = moveIndex;

        const playNext = () => {
            if (currentIdx >= puzzle.moves.length) return;

            const uci = puzzle.moves[currentIdx];
            const from = uci.slice(0, 2);
            const to = uci.slice(2, 4);
            const prom = uci.length > 4 ? uci[4] : undefined;

            currentFen.move({ from, to, promotion: prom });
            setGame(new Chess(currentFen.fen()));
            currentIdx++;

            if (currentIdx < puzzle.moves.length) {
                setTimeout(playNext, 600);
            }
        };

        playNext();
    };

    const loadPrevious = () => {
        if (history.length > 1) {
            const prev = history[history.length - 2];
            setHistory(h => h.slice(0, -1)); // pop current
            loadPuzzle(prev);
        }
    };

    // Ensure rendering on client side only to avoid hydration mismatch with react-chessboard window usage
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="p-8 text-center">טוען לוח שחמט...</div>;

    return (
        <div className="flex flex-col items-center w-full p-4 space-y-6 select-none pb-8">
            {/* Top Bar */}
            <div className="flex justify-between items-center w-full max-w-[400px] px-2 relative z-50">
                <div className="relative">
                    <button
                        onClick={() => setIsDifficultyMenuOpen(!isDifficultyMenuOpen)}
                        className="flex items-center gap-2 bg-muted/50 hover:bg-muted/80 px-3 py-1.5 rounded-full border border-border transition-colors active:scale-95 cursor-pointer"
                    >
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span className="font-semibold text-sm select-none">
                            {loading ? "..." : puzzle?.rating || "1500"} ELO
                        </span>
                    </button>

                    {/* Difficulty Dropdown */}
                    <AnimatePresence>
                        {isDifficultyMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute top-full mt-2 right-0 bg-card/95 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[200px] z-[100]"
                            >
                                <div className="p-2 space-y-1">
                                    {[
                                        { id: "all", label: "כל הרמות", desc: "שחק בכל רמות הקושי" },
                                        { id: "easy", label: "קל", desc: "עד 1200 ELO" },
                                        { id: "medium", label: "בינוני", desc: "1200-1600 ELO" },
                                        { id: "hard", label: "קשה", desc: "1600-2000 ELO" },
                                        { id: "extreme", label: "אקסטרים", desc: "מעל 2000 ELO" },
                                    ].map(opt => (
                                        <button
                                            key={opt.id}
                                            onClick={() => {
                                                setDifficulty(opt.id as any);
                                                setIsDifficultyMenuOpen(false);
                                                loadPuzzle(undefined, opt.id);
                                            }}
                                            className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 flex flex-col items-end gap-0.5 ${difficulty === opt.id
                                                ? 'bg-primary/20 text-primary border border-primary/30'
                                                : 'hover:bg-black/5 dark:hover:bg-white/5 text-foreground/90 border border-transparent'
                                                }`}
                                        >
                                            <span className="text-sm font-bold">{opt.label}</span>
                                            <span className="text-[10px] opacity-60 font-medium">{opt.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-1.5 flex-wrap justify-end items-center">
                    {/* Turn Indicator */}
                    <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-black/5 dark:border-white/5">
                        <div className={`w-2.5 h-2.5 rounded-full border border-black/20 dark:border-white/20 ${game.turn() === 'w' ? 'bg-white' : 'bg-black'}`} />
                        <span className="text-[11px] font-medium text-foreground/80">
                            {game.turn() === 'w' ? 'תור הלבן' : 'תור השחור'}
                        </span>
                    </div>

                    {puzzle?.themes?.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md capitalize font-medium">
                            {t.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                    ))}
                </div>
            </div>

            {/* Board Layout */}
            <div className="relative w-full max-w-[400px] aspect-square rounded-lg overflow-hidden ring-4 ring-muted shadow-2xl">
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                )}

                <div dir="ltr" className="w-full h-full">
                    <Chessboard
                        position={game.fen()}
                        boardOrientation={puzzle?.fen?.split(" ")[1] === "w" ? "black" : "white"}
                        onPieceDrop={onDrop}
                        onSquareClick={onSquareClick}
                        onPieceClick={onPieceClick}
                        onPieceDragBegin={onPieceDragBegin}
                        onPieceDragEnd={() => setOptionSquares({})}
                        animationDuration={300}
                        customDarkSquareStyle={{ backgroundColor: "#4b7399" }}
                        customLightSquareStyle={{ backgroundColor: "#eae9d2" }}
                        customBoardStyle={{ borderRadius: "8px" }}
                        customSquareStyles={{
                            ...moveSquares,
                            ...optionSquares,
                            ...rightClickedSquares,
                        }}
                    />
                </div>

                {/* Status Overlay Overlay */}
                <AnimatePresence>
                    {status !== "playing" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                        >
                            <div className={`px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md text-white font-bold text-2xl border ${status === 'solved' ? 'bg-green-500/80 border-green-400' :
                                status === 'failed' ? 'bg-red-500/80 border-red-400' :
                                    'bg-orange-500/80 border-orange-400'
                                }`}>
                                {status === "solved" ? "מעולה! פתור" :
                                    status === "failed" ? "טעות, נסה שוב" :
                                        "מהלך לא חוקי"}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="w-full max-w-[400px] grid grid-cols-3 gap-3">
                <button
                    onClick={loadPrevious}
                    disabled={history.length <= 1 || loading}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-card hover:bg-muted border border-border rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 gap-1 shadow-sm"
                >
                    <ArrowRight className="w-5 h-5" />
                    <span className="text-[10px] sm:text-xs font-medium">קודם</span>
                </button>

                <button
                    onClick={showSolution}
                    disabled={status === "solved" || loading}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-card hover:bg-muted border border-border rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 gap-1 shadow-sm"
                >
                    <Eye className="w-5 h-5 text-blue-400" />
                    <span className="text-[10px] sm:text-xs font-medium">פתרון</span>
                </button>

                <button
                    onClick={() => loadPuzzle(undefined, difficulty)}
                    disabled={loading}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 bg-primary text-primary-foreground hover:brightness-110 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 gap-1 shadow-md"
                >
                    <Zap className="w-5 h-5" />
                    <span className="text-[10px] sm:text-xs font-bold">הבא</span>
                </button>
            </div>
        </div>
    );
}
