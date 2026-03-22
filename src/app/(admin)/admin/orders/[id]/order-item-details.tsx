'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ZoomIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItemDetailsProps {
    item: any;
}

export function OrderItemDetails({ item }: OrderItemDetailsProps) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showDescription, setShowDescription] = useState(false);

    const images = (() => {
        const rawImages = item.part?.images;
        if (!rawImages) return [];
        
        if (Array.isArray(rawImages)) return rawImages;

        if (typeof rawImages === 'string') {
            const trimmed = rawImages.trim();
            if (!trimmed) return [];

            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                try {
                    const parsed = JSON.parse(trimmed);
                    return Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    console.error("JSON parse failed for images:", e);
                }
            }

            if (trimmed.includes(',')) {
                return trimmed.split(',').map(s => s.trim()).filter(Boolean);
            }
            
            return [trimmed];
        }

        return [];
    })();

    const mainImage = images[0] || null;

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
            {/* Image Section */}
            <div className="relative group shrink-0">
                <div 
                    className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xs text-gray-400 overflow-hidden border border-gray-200 dark:border-gray-700 font-bold cursor-zoom-in relative"
                    onClick={() => {
                        if (mainImage) {
                            setCurrentIndex(0);
                            setIsZoomed(true);
                        }
                    }}
                >
                    {mainImage ? (
                        <img src={mainImage} alt={item.part?.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    ) : (
                        "Nincs kép"
                    )}
                    {mainImage && (
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white" />
                        </div>
                    )}
                    {images.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded font-black">
                            +{images.length - 1}
                        </div>
                    )}
                </div>

                {/* Lightbox / Zoom Portal */}
                <AnimatePresence>
                    {isZoomed && images.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 select-none"
                            onClick={() => setIsZoomed(false)}
                        >
                            {/* Top Controls */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-center text-white z-[110]">
                                <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md border border-white/10">
                                    {currentIndex + 1} / {images.length}
                                </span>
                                <button 
                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md border border-white/10"
                                    onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
                                >
                                    <X className="w-8 h-8" />
                                </button>
                            </div>

                            {/* Navigation Buttons */}
                            {images.length > 1 && (
                                <>
                                    <button 
                                        className="absolute left-4 md:left-10 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-[110] border border-white/5 group"
                                        onClick={prevImage}
                                    >
                                        <ChevronDown className="w-10 h-10 rotate-90 group-hover:-translate-x-1 transition-transform" />
                                    </button>
                                    <button 
                                        className="absolute right-4 md:right-10 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all z-[110] border border-white/5 group"
                                        onClick={nextImage}
                                    >
                                        <ChevronDown className="w-10 h-10 -rotate-90 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </>
                            )}

                            {/* Main Image Container */}
                            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                <motion.img 
                                    key={currentIndex}
                                    initial={{ scale: 0.9, opacity: 0, x: 20 }}
                                    animate={{ scale: 1, opacity: 1, x: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, x: -20 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    src={images[currentIndex]} 
                                    alt={item.part?.name} 
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>

                            {/* Thumbnails (Optional but nice) */}
                            {images.length > 1 && (
                                <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 px-10 overflow-x-auto no-scrollbar py-4 z-[110]">
                                    {images.map((img: string, idx: number) => (
                                        <div 
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                            className={`w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden cursor-pointer transition-all border-2 shrink-0 ${idx === currentIndex ? 'border-[var(--color-primary)] scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-col gap-1">
                    <p className="font-bold text-gray-900 dark:text-white leading-tight">{item.part?.name || 'Ismeretlen termék'}</p>
                    <p className="text-sm font-medium text-[var(--color-primary)]">
                        {item.part?.VehicleBrand?.name} {item.part?.VehicleModel?.name}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs uppercase tracking-wider px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded font-black text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 shadow-sm">
                        SKU: {item.part?.sku || 'N/A'}
                    </span>
                    <span className="text-xs uppercase tracking-wider px-2 py-1 bg-orange-50 dark:bg-orange-500/10 rounded font-black text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20 shadow-sm">
                        REF: {item.part?.productCode || 'N/A'}
                    </span>
                </div>

                {/* Description Toggle */}
                {item.part?.description && (
                    <div className="mt-2">
                        <button 
                            onClick={() => setShowDescription(!showDescription)}
                            className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[var(--color-primary)] transition-colors flex items-center gap-1 group"
                        >
                            {showDescription ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            Termék leírása
                            <span className="h-[1px] w-4 bg-gray-200 dark:bg-zinc-800 group-hover:bg-[var(--color-primary)] transition-colors ml-1"></span>
                        </button>
                        
                        <AnimatePresence>
                            {showDescription && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div 
                                        className="mt-2 p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-sm text-gray-600 dark:text-gray-400 prose dark:prose-invert max-w-none border border-gray-100 dark:border-white/5"
                                        dangerouslySetInnerHTML={{ __html: item.part.description }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
