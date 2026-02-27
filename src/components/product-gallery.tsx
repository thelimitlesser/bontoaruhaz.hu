"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    return (
        <div className="space-y-4 w-full">
            {/* 
                FINAL STABLE GALLERY 
                - Rounded Corners (3rem)
                - Strong Neon Border & Shadow
            */}
            <div
                className="relative w-full h-[350px] md:h-[500px] bg-black/5 dark:bg-[#0c0c16] overflow-hidden group transition-all duration-500"
                style={{
                    borderRadius: '50px',
                    border: '4px solid #db513c',
                    boxShadow: '0 0 60px rgba(219,81,60,0.4)'
                }}
            >
                {/* Inner Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(219,81,60,0.2)_0%,_transparent_70%)] pointer-events-none" />

                {/* Standard Image Tag for maximum compatibility */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={selectedImage}
                    alt={productName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ borderRadius: '46px' }}
                />

                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-20 pointer-events-none" />
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className={clsx(
                                "relative w-24 h-24 shrink-0 overflow-hidden transition-all duration-300",
                                selectedImage === img
                                    ? "ring-2 ring-[#db513c] ring-offset-2 ring-offset-background scale-105 shadow-[0_0_15px_rgba(219,81,60,0.5)]"
                                    : "opacity-60 hover:opacity-100 hover:scale-105"
                            )}
                            style={{ borderRadius: '20px' }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img}
                                className="object-cover w-full h-full"
                                alt={`${productName} - kép ${idx + 1}`}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
