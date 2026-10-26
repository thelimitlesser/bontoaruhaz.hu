export const DEFAULT_WARMTH = -15;

/**
 * Applies warmth/color temperature correction to a 2D canvas context.
 * warmth: negative cools down (reduces yellow/red, increases blue),
 *         positive warms up.
 * Default warmth: -15 (subtle, natural cooling without harsh blue tint).
 */
export const applyWarmthCorrectionToCanvas = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    warmth: number = DEFAULT_WARMTH
) => {
    if (warmth === 0) return;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Scale: warmth -15 -> factor -0.15
    // Red: 0.94 (-6%), Green: 0.985 (-1.5%), Blue: 1.105 (+10.5%)
    const factor = warmth / 100;
    const rMult = 1 + factor * 0.4;
    const gMult = 1 + factor * 0.1;
    const bMult = 1 - factor * 0.7;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i] * rMult;
        const g = data[i + 1] * gMult;
        const b = data[i + 2] * bMult;

        data[i] = r > 255 ? 255 : r < 0 ? 0 : r;
        data[i + 1] = g > 255 ? 255 : g < 0 ? 0 : g;
        data[i + 2] = b > 255 ? 255 : b < 0 ? 0 : b;
    }

    ctx.putImageData(imgData, 0, 0);
};

/**
 * Compresses an image file to WebP format using the browser's Canvas API.
 * Resizes the image to fit within MAX_WIDTH x MAX_HEIGHT while maintaining aspect ratio.
 * Supports HEIC/HEIF conversion and optional warmth correction.
 */
export const compressImage = async (
    file: File,
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.80,
    options?: { warmth?: number }
): Promise<File> => {
    let processingFile = file;

    // Handle HEIC/HEIF (common on iPhones, problematic on Windows/Web)
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
            const heic2any = (await import('heic2any')).default;
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.9
            });
            // heic2any can return an array if it's a multi-frame HEIC
            const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
            processingFile = new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), { type: 'image/jpeg' });
        } catch (err) {
            console.warn("HEIC conversion failed, attempting normal processing:", err);
        }
    }

    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(processingFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    if (options?.warmth && options.warmth !== 0) {
                        applyWarmthCorrectionToCanvas(ctx, width, height, options.warmth);
                    }
                }

                canvas.toBlob((blob) => {
                    if (blob) {
                        const newName = processingFile.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const compressedFile = new File([blob], newName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        resolve(processingFile);
                    }
                }, 'image/webp', quality);
            };
            img.onerror = () => resolve(processingFile);
        };
        reader.onerror = () => resolve(processingFile);
    });
};

/**
 * Adjusts warmth of an existing File or Blob without resizing, outputs WebP.
 */
export const adjustImageWarmth = async (
    file: File,
    warmth: number = DEFAULT_WARMTH,
    quality = 0.80
): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }
                ctx.drawImage(img, 0, 0);
                if (warmth !== 0) {
                    applyWarmthCorrectionToCanvas(ctx, img.width, img.height, warmth);
                }
                canvas.toBlob((blob) => {
                    if (blob) {
                        const newName = file.name.replace(/\.[^/.]+$/, "").replace(/_cooled$/, "") + "_cooled.webp";
                        const adjustedFile = new File([blob], newName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(adjustedFile);
                    } else {
                        resolve(file);
                    }
                }, 'image/webp', quality);
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};

/**
 * Adjusts warmth of an image URL (such as existing Supabase storage URLs), outputs WebP File.
 */
export const adjustUrlWarmth = async (
    imageUrl: string,
    warmth: number = DEFAULT_WARMTH,
    quality = 0.80
): Promise<File | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0);
            if (warmth !== 0) {
                applyWarmthCorrectionToCanvas(ctx, img.width, img.height, warmth);
            }
            canvas.toBlob((blob) => {
                if (blob) {
                    const adjustedFile = new File([blob], `adjusted-${Date.now()}_cooled.webp`, {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });
                    resolve(adjustedFile);
                } else {
                    resolve(null);
                }
            }, 'image/webp', quality);
        };
        img.onerror = () => resolve(null);
        img.src = imageUrl;
    });
};


