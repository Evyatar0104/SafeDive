import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch("https://lichess.org/api/puzzle/daily", {
            headers: {
                Accept: "application/json",
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error(`Lichess API returned ${res.status}`);
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    }
}
