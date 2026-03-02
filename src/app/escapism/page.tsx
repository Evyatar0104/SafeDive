"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { fetchAndCacheContent, EscapismItem } from "@/lib/offline-storage";
import { RefreshCcw } from "lucide-react";
import Image from "next/image";

export default function Escapism() {
    const [items, setItems] = useState<EscapismItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        async function loadContent() {
            const content = await fetchAndCacheContent();
            if (content.escapism.length > 0) {
                setItems(content.escapism);
            }
        }
        loadContent();
    }, []);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col min-h-full py-8 text-center justify-center animate-pulse">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
                <div className="h-6 bg-muted rounded w-1/2 mx-auto" />
            </div>
        );
    }

    const currentItem = items[currentIndex];

    return (
        <div className="flex flex-col min-h-screen pb-24">
            <div className="px-4 pt-8 w-full max-w-md mx-auto flex flex-col min-h-[85vh]">
                <PageHeader title="אסקפיזם" />

                <div className="flex-1 flex flex-col relative animate-in fade-in duration-700">
                    <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-sm bg-muted mb-8">
                        <Image
                            src={currentItem.imageUrl}
                            alt={currentItem.title}
                            fill
                            className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
                            priority
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                            <h2 className="text-white text-3xl font-bold mb-2">
                                {currentItem.title}
                            </h2>
                        </div>
                    </div>

                    <div className="bg-card rounded-3xl p-6 shadow-sm border border-muted flex-1 flex flex-col">
                        <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                            "{currentItem.fact}"
                        </p>

                        <button
                            onClick={handleNext}
                            className="mt-auto pt-6 flex w-full items-center justify-center gap-2 text-primary hover:text-primary/80 font-bold transition-colors active:scale-95"
                        >
                            <RefreshCcw className="w-5 h-5" />
                            <span>הראה לי עוד</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
