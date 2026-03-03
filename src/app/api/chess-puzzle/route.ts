import { NextResponse } from "next/server";
import localPuzzles from "@/lib/chess-puzzles.json";

// Explicit allowlist — any other value is rejected with 400 Bad Request.
const VALID_DIFFICULTIES = new Set(["all", "easy", "medium", "hard", "extreme"]);

export async function GET(request: Request) {
    const url = new URL(request.url);
    const difficulty = url.searchParams.get("difficulty") || "all";

    // Input validation — reject unexpected values immediately.
    if (!VALID_DIFFICULTIES.has(difficulty)) {
        return NextResponse.json(
            { error: "Invalid difficulty. Must be one of: all, easy, medium, hard, extreme." },
            { status: 400 }
        );
    }

    let filteredPuzzles = localPuzzles;
    if (difficulty !== "all") {
        filteredPuzzles = localPuzzles.filter((p) => {
            if (difficulty === "easy") return p.rating < 1200;
            if (difficulty === "medium") return p.rating >= 1200 && p.rating < 1600;
            if (difficulty === "hard") return p.rating >= 1600 && p.rating < 2000;
            if (difficulty === "extreme") return p.rating >= 2000;
            return true;
        });

        // Fallback to all puzzles if the filter yields nothing.
        if (filteredPuzzles.length === 0) {
            filteredPuzzles = localPuzzles;
        }
    }

    const randomIndex = Math.floor(Math.random() * filteredPuzzles.length);
    return NextResponse.json(filteredPuzzles[randomIndex]);
}
