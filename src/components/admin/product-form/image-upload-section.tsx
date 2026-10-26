"use client";

import { Upload, X as CloseIcon, Loader2, GripVertical, ArrowLeft, ArrowRight, ZoomIn, X, RotateCw, Sparkles, Snowflake } from "lucide-react";
import { compressImage, adjustImageWarmth, adjustUrlWarmth, DEFAULT_WARMTH } from "@/utils/image-utils";
import clsx from "clsx";
import { Reorder, AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

export interface ImageItem {
    file?: File;
    preview: string;
    isExisting?: boolean;
    originalUrl?: string;
    rawFile?: File;
    rawPreview?: string;
    isCooled?: boolean;
}

interface ImageUploadSectionProps {
    images: ImageItem[];
    setImages: React.Dispatch<React.SetStateAction<ImageItem[]>>;
    isCompressing: boolean;
    setIsCompressing: React.Dispatch<React.SetStateAction<boolean>>;
    errors?: string[];
}

export function ImageUploadSection({ images, setImages, isCompressing, setIsCompressing, errors = [] }: ImageUploadSectionProps) {
    const [zoomImage, setZoomImage] = useState<string | null>(null);
    const [isWarmthCorrectionActive, setIsWarmthCorrectionActive] = useState<boolean>(false);
    const [isAdjustingWarmth, setIsAdjustingWarmth] = useState<boolean>(false);

    // Synchronize switch state on mount and when images are loaded
    useEffect(() => {
        // 1. If images are already marked as cooled, switch should stay ON!
        if (images.length > 0 && images.some(img => img.isCooled)) {
            setIsWarmthCorrectionActive(true);
            return;
        }

        // 2. If editing an existing product whose images are NOT cooled, keep it OFF
        if (images.length > 0 && images.some(img => img.isExisting)) {
            setIsWarmthCorrectionActive(false);
            return;
        }

        // 3. For new product creation, restore user's saved preference
        try {
            const savedPref = localStorage.getItem('admin_warmth_correction');
            if (savedPref === 'true') {
                setIsWarmthCorrectionActive(true);
            } else if (savedPref === 'false') {
                setIsWarmthCorrectionActive(false);
            }
        } catch (e) {}
    }, [images]);
    
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const rawFiles = Array.from(e.target.files);
            const totalImages = images.length + rawFiles.length;

            if (totalImages > 7) {
                alert("Maximum 7 képet tölthet fel!");
                e.target.value = '';
                return;
            }

            setIsCompressing(true);
            try {
                // Compress raw files to base WebP files
                const compressedFiles = await Promise.all(rawFiles.map(file => compressImage(file)));

                const newImageData = await Promise.all(
                    compressedFiles.map(async (rawFile) => {
                        const rawPreview = URL.createObjectURL(rawFile);
                        if (isWarmthCorrectionActive) {
                            const cooledFile = await adjustImageWarmth(rawFile, DEFAULT_WARMTH);
                            const cooledPreview = URL.createObjectURL(cooledFile);
                            return {
                                file: cooledFile,
                                preview: cooledPreview,
                                isExisting: false,
                                rawFile,
                                rawPreview,
                                isCooled: true,
                            };
                        } else {
                            return {
                                file: rawFile,
                                preview: rawPreview,
                                isExisting: false,
                                rawFile,
                                rawPreview,
                                isCooled: false,
                            };
                        }
                    })
                );

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

    /**
     * Toggles warmth correction for ALL images currently in the list.
     * Guaranteed idempotent: always regenerates from the pristine original base
     * (originalUrl for existing DB images, rawFile for newly uploaded images).
     */
    const handleToggleWarmthCorrection = async () => {
        const nextState = !isWarmthCorrectionActive;
        setIsWarmthCorrectionActive(nextState);

        try {
            localStorage.setItem('admin_warmth_correction', nextState ? 'true' : 'false');
        } catch (e) {}

        if (images.length === 0) return;

        setIsAdjustingWarmth(true);
        try {
            const updatedImages = await Promise.all(
                images.map(async (img) => {
                    const originalUrl = img.originalUrl || (img.isExisting ? img.preview : undefined);
                    const rawFile = img.rawFile || (!originalUrl ? img.file : undefined);
                    const rawPreview = img.rawPreview || (originalUrl || (rawFile ? URL.createObjectURL(rawFile) : img.preview));

                    if (nextState) {
                        // Turning ON cooling: ALWAYS generate from pristine base
                        if (rawFile) {
                            const cooled = await adjustImageWarmth(rawFile, DEFAULT_WARMTH);
                            const cooledPreview = URL.createObjectURL(cooled);
                            return {
                                file: cooled,
                                preview: cooledPreview,
                                rawFile,
                                rawPreview,
                                isExisting: false,
                                isCooled: true,
                            };
                        } else if (originalUrl) {
                            const cooled = await adjustUrlWarmth(originalUrl, DEFAULT_WARMTH);
                            if (cooled) {
                                return {
                                    file: cooled,
                                    preview: URL.createObjectURL(cooled),
                                    originalUrl,
                                    rawPreview: originalUrl,
                                    isExisting: false,
                                    isCooled: true,
                                };
                            }
                        }
                        return img;
                    } else {
                        // Turning OFF cooling: revert to pristine base!
                        if (img.preview && img.preview.startsWith('blob:') && img.preview !== rawPreview) {
                            URL.revokeObjectURL(img.preview);
                        }

                        if (originalUrl) {
                            return {
                                preview: originalUrl,
                                originalUrl,
                                isExisting: true,
                                file: undefined,
                                isCooled: false,
                            };
                        } else if (rawFile) {
                            return {
                                file: rawFile,
                                preview: rawPreview,
                                rawFile,
                                rawPreview,
                                isExisting: false,
                                isCooled: false,
                            };
                        }
                        return img;
                    }
                })
            );
            setImages(updatedImages);
        } catch (err) {
            console.error("Hiba a színhőmérséklet módosításakor:", err);
        } finally {
            setIsAdjustingWarmth(false);
        }
    };

    /**
     * Toggles warmth correction for a single specific image (idempotent from pristine source)
     */
    const toggleSingleImageWarmth = async (index: number) => {
        const img = images[index];
        if (!img) return;

        try {
            const originalUrl = img.originalUrl || (img.isExisting ? img.preview : undefined);
            const rawFile = img.rawFile || (!originalUrl ? img.file : undefined);
            const rawPreview = img.rawPreview || (originalUrl || (rawFile ? URL.createObjectURL(rawFile) : img.preview));

            const newImages = [...images];
            if (img.isCooled) {
                // Revert to original
                if (img.preview && img.preview.startsWith('blob:') && img.preview !== rawPreview) {
                    URL.revokeObjectURL(img.preview);
                }
                if (originalUrl) {
                    newImages[index] = {
                        preview: originalUrl,
                        originalUrl,
                        isExisting: true,
                        file: undefined,
                        isCooled: false,
                    };
                } else if (rawFile) {
                    newImages[index] = {
                        file: rawFile,
                        preview: rawPreview,
                        rawFile,
                        rawPreview,
                        isExisting: false,
                        isCooled: false,
                    };
                }
            } else {
                // Cool down this specific image from pristine source!
                if (rawFile) {
                    const cooled = await adjustImageWarmth(rawFile, DEFAULT_WARMTH);
                    const cooledPreview = URL.createObjectURL(cooled);
                    newImages[index] = {
                        file: cooled,
                        preview: cooledPreview,
                        rawFile,
                        rawPreview,
                        isExisting: false,
                        isCooled: true,
                    };
                } else if (originalUrl) {
                    const cooled = await adjustUrlWarmth(originalUrl, DEFAULT_WARMTH);
                    if (cooled) {
                        newImages[index] = {
                            file: cooled,
                            preview: URL.createObjectURL(cooled),
                            originalUrl,
                            rawPreview: originalUrl,
                            isExisting: false,
                            isCooled: true,
                        };
                    }
                }
            }
            setImages(newImages);
        } catch (err) {
            console.error("Hiba az egyéni kép hidegítésekor:", err);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        if (!newImages[index].isExisting) {
            URL.revokeObjectURL(newImages[index].preview);
            if (newImages[index].rawPreview && newImages[index].rawPreview !== newImages[index].preview) {
                URL.revokeObjectURL(newImages[index].rawPreview!);
            }
        }
        newImages.splice(index, 1);
        setImages(newImages);
    };

    const rotateImage = (index: number) => {
        const img = images[index];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
            // Rotate 90 deg clockwise
            canvas.width = image.height;
            canvas.height = image.width;
            
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(90 * Math.PI / 180);
            ctx.drawImage(image, -image.width / 2, -image.height / 2);
            
            canvas.toBlob((blob) => {
                if (blob) {
                    const rotatedName = img.file?.name?.replace(/\.[^/.]+$/, "") + ".webp" || `rotated-${Date.now()}.webp`;
                    const rotatedFile = new File([blob], rotatedName, { type: 'image/webp' });
                    const newPreview = URL.createObjectURL(rotatedFile);
                    
                    if (!img.isExisting) {
                        URL.revokeObjectURL(img.preview);
                    }
                    
                    const newImages = [...images];
                    newImages[index] = {
                        ...img,
                        file: rotatedFile,
                        preview: newPreview,
                        rawFile: rotatedFile,
                        rawPreview: newPreview,
                        isExisting: false,
                    };
                    setImages(newImages);
                }
            }, 'image/webp', 0.85);
        };
        image.src = img.preview;
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 gap-2">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-gray-900">Termék Fotók</h2>
                    <p className="text-[10px] text-gray-500 font-medium">Húzd a képeket, vagy használd a nyilakat a sorrend módosításához.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Minimalist Sliding Snowflake Button */}
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isWarmthCorrectionActive}
                        onClick={handleToggleWarmthCorrection}
                        disabled={isAdjustingWarmth || isCompressing}
                        title={isWarmthCorrectionActive ? "Hidegítés bekapcsolva (-15 melegség)" : "Hidegítés / Sárgátlanítás (-15 melegség)"}
                        className={clsx(
                            "relative inline-flex h-7 w-[52px] shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ease-in-out cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 select-none shadow-inner",
                            isWarmthCorrectionActive 
                                ? "bg-blue-500 border border-blue-600" 
                                : "bg-gray-200 border border-gray-300 hover:bg-gray-300"
                        )}
                    >
                        <span
                            className={clsx(
                                "flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out",
                                isWarmthCorrectionActive ? "translate-x-6" : "translate-x-0"
                            )}
                        >
                            {isAdjustingWarmth ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                            ) : (
                                <Snowflake 
                                    className={clsx(
                                        "w-3.5 h-3.5 transition-colors duration-300",
                                        isWarmthCorrectionActive ? "text-blue-600" : "text-gray-400"
                                    )} 
                                />
                            )}
                        </span>
                    </button>

                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 uppercase tracking-tighter">
                        Első kép = Fő kép
                    </span>
                </div>
            </div>
            
            <Reorder.Group 
                axis="x" 
                values={images} 
                onReorder={setImages}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-6"
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
                            {img.isCooled && (
                                <div className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md uppercase tracking-tight flex items-center gap-1">
                                    <Snowflake className="w-2.5 h-2.5" /> Hidegített
                                </div>
                            )}
                        </div>

                        {/* Drag & Move Overlay (Visible on hover) */}
                        <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2.5 p-2">
                            <GripVertical className="text-white w-5 h-5 opacity-60" />
                            
                            <div className="flex items-center gap-1.5">
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

                            <div className="flex items-center gap-1.5">
                                {/* Individual Warmth / Cooling Toggle Button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleSingleImageWarmth(index);
                                    }}
                                    className={clsx(
                                        "p-1.5 rounded-lg transition-all shadow-md text-white",
                                        img.isCooled 
                                            ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-white/70" 
                                            : "bg-white/20 hover:bg-white text-white hover:text-gray-900"
                                    )}
                                    title={img.isCooled ? "Eredeti meleg színek visszaállítása" : "Kép hidegítése (-15 melegség)"}
                                >
                                    <Snowflake className="w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        rotateImage(index);
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-lg transition-all shadow-md"
                                    title="Forgatás 90°"
                                >
                                    <RotateCw className="w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setZoomImage(img.preview);
                                    }}
                                    className="bg-[var(--color-primary)] hover:bg-orange-600 text-white p-1.5 rounded-lg transition-all shadow-md"
                                    title="Nagyítás"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>

                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-lg transition-all shadow-md"
                                    title="Törlés"
                                >
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </Reorder.Item>
                ))}
                
                {images.length < 7 && (
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
                            disabled={isCompressing || isAdjustingWarmth}
                        />
                        {isCompressing || isAdjustingWarmth ? (
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
                                    {7 - images.length} hely maradt
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
                <span>A feltöltött képeket a rendszer automatikusan felbontja és WebP-re tömöríti. A képeket 90 fokonként forgathatod és külön-külön is hidegítheted.</span>
                {(isCompressing || isAdjustingWarmth) && <span className="text-[var(--color-primary)] font-bold animate-pulse">⚙️ Képek optimalizálása...</span>}
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

