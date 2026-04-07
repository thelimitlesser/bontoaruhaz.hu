"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
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
                className="relative w-full aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 overflow-hidden group transition-all duration-300 cursor-zoom-in touch-pan-y" style={{
                    borderRadius: '50px',
                    border: '1px solid var(--color-border)',
                }}
                onClick={() => setIsFullscreen(true)}
            >

                {/* Skeleton Loader */}
                {!isLoaded && (
                    <div className="absolute inset-0 bg-muted animate-pulse z-20" style={{ borderRadius: '46px' }} />
                )}

                {/* Blurred Background Layer */}
                <div className="absolute inset-0 overflow-hidden">
                    <Image
                        key={`${selectedImage}-bg`}
                        src={selectedImage}
                        alt=""
                        fill
                        className={clsx(
                            "object-cover blur-2xl scale-110 opacity-60 transition-opacity duration-500",
                            isLoaded ? "opacity-60" : "opacity-0"
                        )}
                    />
                    <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-sm" />
                </div>

                {/* Foreground Sharp Image */}
                <Image
                    key={selectedImage}
                    src={selectedImage}
                    alt={productName}
                    onLoadingComplete={() => setIsLoaded(true)}
                    fill
                    priority={true}
                    className={clsx(
                        "object-contain z-10 transition-transform duration-500 hover:scale-105 drop-shadow-2xl",
                        isLoaded ? "opacity-100" : "opacity-0"
                    )}
                />

                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-30 pointer-events-none z-20" />


                {/* Main View Navigation Arrows */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 p-4 md:p-6 text-white transition-all duration-300 hover:scale-125 z-10 active:scale-90 group"
                            aria-label="Előző kép"
                        >
                            <ChevronLeft className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_2px_rgba(0,0,0,1)] group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-4 md:p-6 text-white transition-all duration-300 hover:scale-125 z-10 active:scale-90 group"
                            aria-label="Következő kép"
                        >
                            <ChevronRight className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_2px_rgba(0,0,0,1)] group-hover:translate-x-1 transition-transform" />
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
                            aria-label={`${idx + 1}. kép kiválasztása`}
                            aria-current={currentIndex === idx ? "true" : "false"}
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

            {/* Fullscreen Lightbox Modal (Aligned with Admin Order style) */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 md:p-10 select-none cursor-default"
                        onClick={() => setIsFullscreen(false)}
                    >
                        {/* Top Controls */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white z-[120]">
                            <span className="bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-md border border-white/10 shadow-xl">
                                {currentIndex + 1} / {images.length}
                            </span>
                            <button
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-md border border-white/10 shadow-xl active:scale-90"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsFullscreen(false);
                                }}
                                title="Bezárás (Esc)"
                                aria-label="Nagyítás bezárása"
                            >
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Navigation Buttons */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="fixed left-0 md:left-4 top-1/2 -translate-y-1/2 p-6 md:p-10 text-white transition-all z-[110] group active:scale-90"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrev(e);
                                    }}
                                    aria-label="Előző kép"
                                >
                                    <ChevronLeft className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_3px_rgba(0,0,0,1)] group-hover:-translate-x-2 transition-transform" />
                                </button>
                                <button
                                    className="fixed right-0 md:right-4 top-1/2 -translate-y-1/2 p-6 md:p-10 text-white transition-all z-[110] group active:scale-90"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNext(e);
                                    }}
                                    aria-label="Következő kép"
                                >
                                    <ChevronRight className="w-12 h-12 md:w-16 md:h-16 drop-shadow-[0_0_3px_rgba(0,0,0,1)] group-hover:translate-x-2 transition-transform" />
                                </button>
                            </>
                        )}

                        {/* Main Image Container - Full size, centered */}
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                <Image
                                    key={selectedImage}
                                    src={selectedImage}
                                    alt={productName}
                                    fill
                                    className="object-contain rounded-lg shadow-[0_0_100px_rgba(0,0,0,0.5)]"
                                    onClick={(e) => e.stopPropagation()}
                                />
                        </div>

                        {/* Thumbnails at bottom for easy switching */}
                        {images.length > 1 && (
                            <div
                                className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 px-10 overflow-x-auto no-scrollbar py-4 z-[110]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={clsx(
                                            "relative w-16 h-16 shrink-0 overflow-hidden transition-all duration-300 rounded-xl border-2",
                                            selectedImage === img
                                                ? "border-[var(--color-primary)] scale-110 shadow-2xl opacity-100"
                                                : "border-transparent opacity-40 hover:opacity-100"
                                        )}
                                        aria-label={`${idx + 1}. nézőkép`}
                                        aria-current={selectedImage === img ? "true" : "false"}
                                    >
                                        <Image 
                                            src={img} 
                                            fill 
                                            className="object-cover" 
                                            alt={`${productName} - ${idx + 1}. kép`} 
                                            sizes="64px"
                                        />
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
