export const DEFAULT_WARMTH = -15;

/**
 * Calculates resized dimensions to fit within maxWidth x maxHeight while maintaining aspect ratio.
 */
export const calculateAspectRatioFit = (
    srcWidth: number,
    srcHeight: number,
    maxWidth = 1000,
    maxHeight = 1000
): { width: number; height: number } => {
    let width = srcWidth;
    let height = srcHeight;

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
    return { width: Math.max(1, width), height: Math.max(1, height) };
};

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
 * Safely converts canvas to a compact lossy Blob.
 * Tries WebP first. If the browser (like Safari on macOS/iOS) does not support
 * WebP canvas export and silently falls back to PNG (which produces 1.5MB - 10MB+ files
 * that trigger Vercel's 4.5MB FUNCTION_PAYLOAD_TOO_LARGE limit), it immediately
 * re-exports as JPEG (~50-80KB).
 */
export const canvasToBlobSafe = (
    canvas: HTMLCanvasElement,
    quality = 0.80
): Promise<{ blob: Blob; format: 'webp' | 'jpeg' }> => {
    return new Promise((resolve, reject) => {
        try {
            canvas.toBlob((blob) => {
                if (!blob) {
                    // Try JPEG fallback
                    canvas.toBlob((jpegBlob) => {
                        if (jpegBlob) {
                            resolve({ blob: jpegBlob, format: 'jpeg' });
                        } else {
                            reject(new Error("Canvas toBlob failed"));
                        }
                    }, 'image/jpeg', quality);
                    return;
                }

                // If browser returned PNG instead of WebP (Safari behavior when webp encoding is unsupported)
                if (blob.type === 'image/png') {
                    canvas.toBlob((jpegBlob) => {
                        if (jpegBlob) {
                            resolve({ blob: jpegBlob, format: 'jpeg' });
                        } else {
                            // In the unlikely event JPEG fails, resolve with what we have
                            resolve({ blob, format: 'webp' });
                        }
                    }, 'image/jpeg', quality);
                    return;
                }

                resolve({ blob, format: 'webp' });
            }, 'image/webp', quality);
        } catch (err) {
            try {
                canvas.toBlob((jpegBlob) => {
                    if (jpegBlob) resolve({ blob: jpegBlob, format: 'jpeg' });
                    else reject(err);
                }, 'image/jpeg', quality);
            } catch {
                reject(err);
            }
        }
    });
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
            img.onload = async () => {
                const { width, height } = calculateAspectRatioFit(img.width, img.height, maxWidth, maxHeight);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    if (options?.warmth && options.warmth !== 0) {
                        applyWarmthCorrectionToCanvas(ctx, width, height, options.warmth);
                    }
                }

                try {
                    const { blob, format } = await canvasToBlobSafe(canvas, quality);
                    const newName = processingFile.name.replace(/\.[^/.]+$/, "") + `.${format}`;
                    const compressedFile = new File([blob], newName, {
                        type: format === 'webp' ? 'image/webp' : 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                } catch {
                    resolve(processingFile);
                }
            };
            img.onerror = () => resolve(processingFile);
        };
        reader.onerror = () => resolve(processingFile);
    });
};

/**
 * Adjusts warmth of an existing File or Blob with 1000x1000 resizing, outputs WebP/JPEG File.
 */
export const adjustImageWarmth = async (
    file: File,
    warmth: number = DEFAULT_WARMTH,
    quality = 0.80,
    maxWidth = 1000,
    maxHeight = 1000
): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = async () => {
                const { width, height } = calculateAspectRatioFit(img.width, img.height, maxWidth, maxHeight);
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    resolve(file);
                    return;
                }
                ctx.drawImage(img, 0, 0, width, height);
                if (warmth !== 0) {
                    applyWarmthCorrectionToCanvas(ctx, width, height, warmth);
                }

                try {
                    const { blob, format } = await canvasToBlobSafe(canvas, quality);
                    const baseName = file.name.replace(/\.[^/.]+$/, "").replace(/_cooled$/, "");
                    const newName = `${baseName}_cooled.${format}`;
                    const adjustedFile = new File([blob], newName, {
                        type: format === 'webp' ? 'image/webp' : 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(adjustedFile);
                } catch {
                    resolve(file);
                }
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};

/**
 * Adjusts warmth of an image URL (such as existing Supabase storage URLs),
 * with 1000x1000 dimension constraint and compact lossy compression.
 */
export const adjustUrlWarmth = async (
    imageUrl: string,
    warmth: number = DEFAULT_WARMTH,
    quality = 0.80,
    maxWidth = 1000,
    maxHeight = 1000
): Promise<File | null> => {
    // 1. Fetch image as blob first to completely avoid Safari/Chrome CORS canvas taint
    try {
        const safeUrl = imageUrl.includes('?') ? `${imageUrl}&cors=1` : `${imageUrl}?cors=1`;
        const res = await fetch(safeUrl);
        if (res.ok) {
            const blob = await res.blob();
            const objectUrl = URL.createObjectURL(blob);

            return await new Promise<File | null>((resolve) => {
                const img = new Image();
                img.onload = async () => {
                    try {
                        const { width, height } = calculateAspectRatioFit(img.width, img.height, maxWidth, maxHeight);
                        const canvas = document.createElement('canvas');
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            URL.revokeObjectURL(objectUrl);
                            resolve(null);
                            return;
                        }
                        ctx.drawImage(img, 0, 0, width, height);
                        if (warmth !== 0) {
                            applyWarmthCorrectionToCanvas(ctx, width, height, warmth);
                        }

                        const { blob: outBlob, format } = await canvasToBlobSafe(canvas, quality);
                        URL.revokeObjectURL(objectUrl);
                        const fileName = `adjusted-${Date.now()}_cooled.${format}`;
                        const adjustedFile = new File([outBlob], fileName, {
                            type: format === 'webp' ? 'image/webp' : 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(adjustedFile);
                    } catch {
                        URL.revokeObjectURL(objectUrl);
                        resolve(null);
                    }
                };
                img.onerror = () => {
                    URL.revokeObjectURL(objectUrl);
                    resolve(null);
                };
                img.src = objectUrl;
            });
        }
    } catch {
        // Fall back to direct Image loading if fetch fails
    }

    // 2. Direct Image() fallback
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = async () => {
            const { width, height } = calculateAspectRatioFit(img.width, img.height, maxWidth, maxHeight);
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(null);
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            if (warmth !== 0) {
                applyWarmthCorrectionToCanvas(ctx, width, height, warmth);
            }

            try {
                const { blob, format } = await canvasToBlobSafe(canvas, quality);
                const adjustedFile = new File([blob], `adjusted-${Date.now()}_cooled.${format}`, {
                    type: format === 'webp' ? 'image/webp' : 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(adjustedFile);
            } catch {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = imageUrl;
    });
};
