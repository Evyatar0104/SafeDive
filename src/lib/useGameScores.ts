import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/lib/logger';

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

/** Returns true only if the value is a non-negative finite number. */
function isSafeScore(value: unknown): value is number {
    return typeof value === 'number' && isFinite(value) && value >= 0;
}

/**
 * Validates raw parsed localStorage data against the expected GameScores shape.
 * Any game with malformed scores is replaced by its defaults.
 */
function sanitiseScores(raw: unknown): GameScores {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return DEFAULT_SCORES;
    }
    const r = raw as Record<string, unknown>;

    function pickNums<T extends Record<string, number>>(stored: unknown, defaults: T): T {
        if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return defaults;
        const s = stored as Record<string, unknown>;
        return Object.fromEntries(
            Object.keys(defaults).map((key) => [key, isSafeScore(s[key]) ? s[key] : defaults[key]])
        ) as T;
    }

    return {
        mathSprint: pickNums(r.mathSprint, DEFAULT_SCORES.mathSprint),
        wordGuess: pickNums(r.wordGuess, DEFAULT_SCORES.wordGuess),
        memoryGrid: pickNums(r.memoryGrid, DEFAULT_SCORES.memoryGrid),
    };
}

export function useGameScores() {
    const [scores, setScores] = useState<GameScores>(DEFAULT_SCORES);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem('activate-mind-scores');
            if (stored) {
                const parsed: unknown = JSON.parse(stored);
                setScores(sanitiseScores(parsed));
            }
        } catch (e) {
            logger.error('Failed to load scores from localStorage', e);
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage when scores change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem('activate-mind-scores', JSON.stringify(scores));
            } catch (e) {
                logger.error('Failed to save scores to localStorage', e);
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

