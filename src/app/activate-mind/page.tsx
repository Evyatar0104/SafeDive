"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { BrainCircuit, RefreshCw } from "lucide-react";

export default function ActivateMind() {
    const [game, setGame] = useState(new Chess());
    const [puzzleState, setPuzzleState] = useState<"loading" | "chess" | "fallback" | "solved">("loading");
    // The solution is a list of UCI moves e.g. ["e2e4", "e7e5"]
    const [solution, setSolution] = useState<string[]>([]);
    const [movesPlayed, setMovesPlayed] = useState(0);
    const [fallbackPuzzle, setFallbackPuzzle] = useState<{ q: string; a: string } | null>(null);

    useEffect(() => {
        async function initPuzzle() {
            try {
                const res = await fetch("/api/daily-puzzle");
                if (!res.ok) throw new Error("Offline or API failed");
                const data = await res.json();

                const initialPgn = data.game.pgn;
                const newGame = new Chess();
                newGame.loadPgn(initialPgn);

                // PGN string has moves up to initialPly. Let's get the final FEN.
                setGame(newGame);
                setSolution(data.puzzle.solution);
                setPuzzleState("chess");
            } catch (err) {
                // Fallback to offline logic
                console.error("Failed to load Lichess puzzle, falling back to logic puzzle", err);
                setFallbackPuzzle({
                    q: "יש לך 8 כדורים זהים, אחד מהם כבד יותר. כמה שקילות צריך במאזניים כדי למצוא אותו?",
                    a: "2 שקילות. נשקול 3 מול 3. אם שווה, נשקול את ה-2 הנותרים. אם לא שווה, ניקח את ה-3 הכבדים ונשקול 1 מול 1 מהם."
                });
                setPuzzleState("fallback");
            }
        }

        initPuzzle();
    }, []);

    function onDrop(sourceSquare: string, targetSquare: string) {
        if (puzzleState === "solved") return false;

        const moveString = `${sourceSquare}${targetSquare}`;
        // Check if the move matches the next move in the solution
        // Note: Lichess solution moves might have promotion e.g. "e7e8q", so we just do basic string match
        const expectedMove = solution[movesPlayed];

        // Check if it's the expected move ignoring promotion for simple drop
        if (expectedMove && expectedMove.startsWith(moveString)) {
            const newGame = new Chess(game.fen());
            try {
                newGame.move({
                    from: sourceSquare,
                    to: targetSquare,
                    promotion: expectedMove.length === 5 ? expectedMove[4] : 'q'
                });
                setGame(newGame);

                if (movesPlayed + 1 >= solution.length) {
                    setPuzzleState("solved");
                    setMovesPlayed(movesPlayed + 1);
                } else {
                    // Play opponent response
                    const responseMoveStr = solution[movesPlayed + 1];
                    setTimeout(() => {
                        const oppGame = new Chess(newGame.fen());
                        oppGame.move({
                            from: responseMoveStr.substring(0, 2),
                            to: responseMoveStr.substring(2, 4),
                            promotion: responseMoveStr.length === 5 ? responseMoveStr[4] : 'q'
                        });
                        setGame(oppGame);

                        if (movesPlayed + 2 >= solution.length) {
                            setPuzzleState("solved");
                        }
                        setMovesPlayed(movesPlayed + 2);
                    }, 400);
                }
                return true;
            } catch (e) {
                return false;
            }
        }
        return false;
    }

    return (
        <div className="flex flex-col min-h-screen pb-24">
            <div className="px-4 pt-8 w-full max-w-md mx-auto">
                <PageHeader title="אקטיבציית המוח" />

                {puzzleState === "loading" && (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-muted-foreground">
                        <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                        <p>טוען אתגר יומי...</p>
                    </div>
                )}

                {puzzleState === "chess" || puzzleState === "solved" ? (
                    <div className="space-y-6 animate-in fade-in duration-700">
                        <div className="bg-card shadow-sm rounded-3xl p-4 sm:p-6 pb-2 border border-muted">
                            <div dir="ltr" className="w-full aspect-square rounded-2xl overflow-hidden mb-4">
                                <Chessboard
                                    position={game.fen()}
                                    onPieceDrop={onDrop}
                                    boardOrientation={game.turn() === "w" ? "white" : "black"}
                                    customDarkSquareStyle={{ backgroundColor: "#007aff" }}
                                    customLightSquareStyle={{ backgroundColor: "#f2f2f7" }}
                                />
                            </div>

                            <div className="text-center py-4">
                                {puzzleState === "solved" ? (
                                    <p className="text-emerald-500 font-bold text-2xl">פתרת את חידת השחמט! 🎉</p>
                                ) : (
                                    <p className="text-lg font-medium">תורך לשחק. מצא את המהלך הטוב ביותר.</p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : null}

                {puzzleState === "fallback" && fallbackPuzzle && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-card shadow-sm rounded-3xl p-8 border border-muted text-center space-y-6">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
                                <BrainCircuit className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold">חידת היגיון יומית</h2>
                            <p className="text-lg leading-relaxed">{fallbackPuzzle.q}</p>

                            <details className="pt-4 border-t border-muted text-right">
                                <summary className="font-bold text-primary cursor-pointer select-none py-2 outline-none">
                                    הצג פתרון
                                </summary>
                                <div className="pt-4 text-foreground/80 leading-relaxed font-medium">
                                    {fallbackPuzzle.a}
                                </div>
                            </details>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
