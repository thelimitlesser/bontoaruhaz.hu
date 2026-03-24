"use client";

import { Upload, X as CloseIcon, Loader2, GripVertical, ArrowLeft, ArrowRight, ZoomIn, X } from "lucide-react";
import { compressImage } from "@/utils/image-utils";
import clsx from "clsx";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

interface ImageUploadSectionProps {
    images: { file?: File; preview: string; isExisting?: boolean }[];
    setImages: React.Dispatch<React.SetStateAction<{ file?: File; preview: string; isExisting?: boolean }[]>>;
    isCompressing: boolean;
    setIsCompressing: React.Dispatch<React.SetStateAction<boolean>>;
    errors?: string[];
}

export function ImageUploadSection({ images, setImages, isCompressing, setIsCompressing, errors = [] }: ImageUploadSectionProps) {
    const [zoomImage, setZoomImage] = useState<string | null>(null);
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const rawFiles = Array.from(e.target.files);
            const totalImages = images.length + rawFiles.length;

            if (totalImages > 5) {
                alert("Maximum 5 képet tölthet fel!");
                e.target.value = '';
                return;
            }

            setIsCompressing(true);
            try {
                const compressedFiles = await Promise.all(rawFiles.map(file => compressImage(file)));

                const newImageData = compressedFiles.map(file => ({
                    file,
                    preview: URL.createObjectURL(file),
                    isExisting: false
                }));

                setImages(prev => [...prev, ...newImageData]);
            } catch (err) {
                console.error("Hiba a képek tömörítése közben:", err);
                alert("Hiba történt a képek feldolgozása közben.");
            } finally {
                setIsCompressing(false);
                e.target.value = '';
            }
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        if (!newImages[index].isExisting) {
            URL.revokeObjectURL(newImages[index].preview);
        }
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const shiftImage = (index: number, direction: 'left' | 'right') => {
        const newIndex = direction === 'left' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= images.length) return;
        
        const newImages = [...images];
        const [target] = newImages.splice(index, 1);
        newImages.splice(newIndex, 0, target);
        setImages(newImages);
    };

    return (
        <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">Termék Fotók</h2>
                    <p className="text-[10px] text-gray-500 font-medium">Húzd a képeket, vagy használd a nyilakat a sorrend módosításához.</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 uppercase tracking-tighter">
                        Első kép = Fő kép
                    </span>
                </div>
            </div>
            
            <Reorder.Group 
                axis="x" 
                values={images} 
                onReorder={setImages}
                className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6"
            >
                {images.map((img, index) => (
                    <Reorder.Item 
                        key={img.preview} 
                        value={img}
                        layout
                        className={clsx(
                            "relative aspect-square rounded-xl overflow-hidden border group flex items-center justify-center bg-gray-50 cursor-grab active:cursor-grabbing",
                            index === 0 ? "border-orange-500 ring-4 ring-orange-500/10 z-10 shadow-xl" : "border-gray-200"
                        )}
                        whileDrag={{ 
                            scale: 1.1, 
                            zIndex: 50,
                            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" 
                        }}
                    >
                        <img src={img.preview} alt={`Preview ${index}`} className="w-full h-full object-cover select-none pointer-events-none" />
                        
                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                            {index === 0 && (
                                <div className="bg-orange-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-md uppercase tracking-tighter">
                                    Fő kép
                                </div>
                            )}
                        </div>

                        {/* Drag & Move Overlay (Visible on hover) */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                            <GripVertical className="text-white w-6 h-6 opacity-50" />
                            
                            <div className="flex items-center gap-2">
                                {index > 0 && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); shiftImage(index, 'left'); }}
                                        className="bg-white/20 hover:bg-white text-white hover:text-gray-900 p-1.5 rounded-lg transition-all"
                                        title="Mozgatás balra"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>
                                )}
                                {index < images.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); shiftImage(index, 'right'); }}
                                        className="bg-white/20 hover:bg-white text-white hover:text-gray-900 p-1.5 rounded-lg transition-all"
                                        title="Mozgatás jobbra"
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all shadow-lg"
                                title="Törlés"
                            >
                                <CloseIcon className="w-4 h-4" />
                            </button>

                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomImage(img.preview);
                                }}
                                className="bg-[var(--color-primary)] hover:bg-orange-600 text-white p-1.5 rounded-lg transition-all shadow-lg"
                                title="Nagyítás"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                    </Reorder.Item>
                ))}
                
                {images.length < 5 && (
                    <label className={clsx(
                        "relative aspect-square rounded-xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center group overflow-hidden",
                        errors.includes("images") 
                            ? "bg-red-50 border-red-500 text-red-600 hover:bg-red-100" 
                            : "bg-gray-50 border-gray-300 hover:border-[var(--color-primary)] text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5"
                    )}>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={isCompressing}
                        />
                        {isCompressing ? (
                            <div className="flex flex-col items-center">
                                <Loader2 className="w-8 h-8 mb-2 animate-spin text-[var(--color-primary)]" />
                                <span className="text-sm font-medium animate-pulse text-[var(--color-primary)]">Feldolgozás...</span>
                            </div>
                        ) : (
                            <>
                                <div className={clsx(
                                    "p-3 rounded-full shadow-sm group-hover:shadow mb-2 transition-all group-hover:scale-110",
                                    errors.includes("images") ? "bg-red-200 text-red-700" : "bg-white text-gray-400 group-hover:text-[var(--color-primary)]"
                                )}>
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-medium">Új kép</span>
                                <span className={clsx("text-xs mt-1", errors.includes("images") ? "text-red-400" : "text-gray-400")}>
                                    {5 - images.length} hely maradt
                                </span>
                            </>
                        )}
                    </label>
                )}
            </Reorder.Group>
            {errors.includes("images") && (
                <p className="text-[10px] text-red-500 font-bold uppercase mt-2 animate-pulse bg-red-50 p-2 rounded border border-red-100 text-center">
                    Legalább egy kép feltöltése kötelező!
                </p>
            )}
            
            <p className="text-xs text-gray-500 italic mt-3 flex items-center justify-between">
                <span>A feltöltött képeket a rendszer automatikusan felbontja, tömöríti (saját gépen), és vízjelezi a szerveren.</span>
                {isCompressing && <span className="text-[var(--color-primary)] font-bold animate-pulse">⚙️ Képek optimalizálása...</span>}
            </p>

            {/* Zoom Modal / Lightbox */}
            <AnimatePresence>
                {zoomImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 md:p-10 cursor-zoom-out"
                        onClick={() => setZoomImage(null)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-md border border-white/10 text-white active:scale-90"
                            onClick={(e) => {
                                e.stopPropagation();
                                setZoomImage(null);
                            }}
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Image Container */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            <motion.img
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                src={zoomImage}
                                alt="Zoomed preview"
                                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
