"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const currentIndex = images.indexOf(selectedImage);

    // Auto-slide logic
    useEffect(() => {
        if (!isAutoPlaying || images.length <= 1 || isFullscreen) return;

        const interval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % images.length;
            setSelectedImage(images[nextIndex]);
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, currentIndex, images.length, isFullscreen]);

    // Handle ESC key and scroll lock
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = 'hidden';
            const handleEsc = (e: KeyboardEvent) => {
                if (e.key === 'Escape') setIsFullscreen(false);
            };
            window.addEventListener('keydown', handleEsc);
            return () => {
                document.body.style.overflow = 'unset';
                window.removeEventListener('keydown', handleEsc);
                setIsZoomed(false); // Reset zoom when closing
            };
        }
    }, [isFullscreen]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAutoPlaying(false); // Stop auto-play on manual interaction
        const nextIndex = (currentIndex + 1) % images.length;
        setSelectedImage(images[nextIndex]);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsAutoPlaying(false); // Stop auto-play on manual interaction
        const prevIndex = (currentIndex - 1 + images.length) % images.length;
        setSelectedImage(images[prevIndex]);
    };

    return (
        <div className="space-y-4 w-full">
            {/* 
                FINAL STABLE GALLERY 
                - Rounded Corners (3rem)
                - Strong Neon Border & Shadow
            */}
            <div
                className="relative w-full h-[350px] md:h-[500px] bg-white overflow-hidden group transition-all duration-300 cursor-zoom-in" style={{
                    borderRadius: '50px',
                    border: '1px solid var(--color-border)',
                }}
                onClick={() => setIsFullscreen(true)}
            >

                {/* Standard Image Tag for maximum compatibility */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <AnimatePresence mode="wait">
                    <motion.img
                        key={selectedImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        src={selectedImage}
                        alt={productName}
                        className="w-full h-full object-cover" style={{ borderRadius: '46px' }}
                    />
                </AnimatePresence>

                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none" />


                {/* Main View Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                        >
                            <ChevronLeft className="w-6 h-6 text-foreground" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 hover:bg-white border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                        >
                            <ChevronRight className="w-6 h-6 text-foreground" />
                        </button>
                    </>
                )}
            </div>

            {/* Pagination Dots */}
            {images.length > 1 && (
                <div className="flex justify-center gap-2 py-2">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setSelectedImage(images[idx]);
                                setIsAutoPlaying(false);
                            }}
                            className="relative w-2.5 h-2.5 rounded-full transition-all duration-300"
                        >
                            <div className={clsx(
                                "absolute inset-0 rounded-full transition-all duration-300",
                                currentIndex === idx
                                    ? "bg-[var(--color-primary)] scale-125"
                                    : "bg-muted hover:bg-muted-foreground scale-100"
                            )} />
                            {currentIndex === idx && (
                                <motion.div
                                    layoutId="activeDot"
                                    className="absolute inset-0 rounded-full bg-[var(--color-primary)] blur-[2px] opacity-50"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Fullscreen Lightbox Modal */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-8 cursor-zoom-out" onClick={() => setIsFullscreen(false)}
                    >
                        {/* Close Button */}
                        <button
                            className="fixed top-4 right-4 md:top-8 md:right-8 p-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-[120] active:scale-95 shadow-2xl backdrop-blur-md" onClick={(e) => {
                                e.stopPropagation();
                                setIsFullscreen(false);
                            }}
                            title="Bezárás (Esc)" >
                            <X className="w-8 h-8 text-white" />
                        </button>

                        {/* Navigation Buttons for Fullscreen */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="fixed left-4 md:left-12 p-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-[110] active:scale-95 backdrop-blur-md shadow-xl group" onClick={handlePrev}
                                >
                                    <ChevronLeft className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                    className="fixed right-4 md:right-12 p-5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all z-[110] active:scale-95 backdrop-blur-md shadow-xl group" onClick={handleNext}
                                >
                                    <ChevronRight className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                                </button>
                            </>
                        )}

                        <div
                            className={clsx("relative w-full h-full flex items-center justify-center transition-all duration-200",
                                isZoomed ? "overflow-auto block" : "overflow-hidden flex")}
                            onClick={() => setIsZoomed(!isZoomed)}
                        >
                            <motion.img
                                key={selectedImage}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                src={selectedImage}
                                alt={productName}
                                className={clsx("transition-all duration-300 shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg",
                                    isZoomed
                                        ? "max-w-none w-[150vw] md:w-[120vw] h-auto cursor-zoom-out" : "w-full h-full max-w-[95vw] max-h-[88vh] object-contain cursor-zoom-in")}
                                onClick={(e) => e.stopPropagation()}
                            />

                            {!isZoomed && (
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-white text-xs font-medium pointer-events-none uppercase tracking-widest animate-pulse">
                                    Kattints a nagyításhoz
                                </div>
                            )}
                        </div>

                        {/* Optional: Add thumbnails to the lightbox too for easy switching without closing */}
                        {images.length > 1 && !isZoomed && (
                            <div
                                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-4 bg-black/50 backdrop-blur-lg rounded-3xl border border-white/10 max-w-[90vw] overflow-x-auto z-[110]" onClick={(e) => e.stopPropagation()}
                            >
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={clsx("relative w-16 h-16 shrink-0 overflow-hidden transition-all duration-300 rounded-xl",
                                            selectedImage === img
                                                ? "ring-2 ring-white scale-110" : "opacity-50 hover:opacity-100")}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} className="object-cover w-full h-full" alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
