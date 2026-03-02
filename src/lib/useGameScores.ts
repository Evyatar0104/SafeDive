import { useState, useEffect, useCallback } from 'react';

export interface GameScores {
    mathSprint: { highScore: number; bestStreak: number };
    wordGuess: { winStreak: number; bestStreak: number };
    memoryGrid: { longestStreak: number; lastScore: number };
}

const DEFAULT_SCORES: GameScores = {
    mathSprint: { highScore: 0, bestStreak: 0 },
    wordGuess: { winStreak: 0, bestStreak: 0 },
    memoryGrid: { longestStreak: 0, lastScore: 0 },
};

export function useGameScores() {
    const [scores, setScores] = useState<GameScores>(DEFAULT_SCORES);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('activate-mind-scores');
            if (stored) {
                setScores({ ...DEFAULT_SCORES, ...JSON.parse(stored) });
            }
        } catch (e) {
            console.error('Failed to load scores from localStorage', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage when scores change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('activate-mind-scores', JSON.stringify(scores));
            } catch (e) {
                console.error('Failed to save scores to localStorage', e);
            }
        }
    }, [scores, isLoaded]);

    const updateScore = useCallback(<T extends keyof GameScores>(game: T, updates: Partial<GameScores[T]>) => {
        setScores((prev) => ({
            ...prev,
            [game]: { ...prev[game], ...updates },
        }));
    }, []);

    return { scores, updateScore, isLoaded };
}
