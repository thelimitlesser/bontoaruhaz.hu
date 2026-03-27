/**
 * Compresses an image file to WebP format using the browser's Canvas API.
 * Resizes the image to fit within MAX_WIDTH x MAX_HEIGHT while maintaining aspect ratio.
 * Now supports HEIC/HEIF conversion for Windows/iPhone compatibility.
 */
export const compressImage = async (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.80): Promise<File> => {
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
                ctx?.drawImage(img, 0, 0, width, height);

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
