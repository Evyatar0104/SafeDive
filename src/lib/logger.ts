/**
 * Minimal production-safe logger.
 * Suppresses all output in production to avoid leaking internal state
 * or stack traces to end users via the browser console.
 */
const isDev = process.env.NODE_ENV !== "production";

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },
    error: (...args: unknown[]) => {
        if (isDev) console.error(...args);
    },
};
