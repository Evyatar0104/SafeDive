"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { TapAnimate } from "@/components/ui/TapAnimate";

interface PageHeaderProps {
    title: string;
}

export function PageHeader({ title }: PageHeaderProps) {
    const router = useRouter();

    return (
        <header className="flex items-center justify-between mb-8 pb-4 border-b border-muted">
            <h1 className="text-3xl font-bold">{title}</h1>
            <TapAnimate>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-primary active:opacity-70 p-2 -mr-2 rounded-xl transition-opacity font-medium text-lg"
                    aria-label="חזור אחורה"
                >
                    <span className="hidden sm:inline">חזור</span>
                    <ChevronRight className="w-6 h-6" />
                </button>
            </TapAnimate>
        </header>
    );
}
