import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface GameModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function GameModal({ isOpen, onClose, title, children }: GameModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="relative w-full h-full max-w-lg mx-auto bg-card sm:rounded-3xl shadow-xl border border-muted flex flex-col overflow-hidden"
                        initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 250 }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-muted bg-card/50 backdrop-blur-sm z-10 relative">
                            <h2 className="text-xl font-bold">{title}</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-muted active:scale-95 transition-transform"
                                aria-label="Close game"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Game Content */}
                        <div className="flex-1 overflow-y-auto w-full relative">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
