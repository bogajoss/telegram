
/**
 * Improves image quality and sharpens it using a canvas, then converts to WebP.
 * It applies a sharpen convolution filter and exports as WebP with 80% quality.
 *
 * @param {File} file - The original image file
 * @returns {Promise<File>} - The processed WebP file
 */
export async function processImage(file: File): Promise<File> {
    // If not an image, return original
    if (!file.type.startsWith("image/")) return file;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    resolve(file); // Fallback to original if context not available
                    return;
                }

                // Set canvas dimensions to image dimensions
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw image to canvas
                ctx.drawImage(img, 0, 0, img.width, img.height);

                // --- SHARPENING LOGIC ---
                // Get image data
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const w = canvas.width;
                const h = canvas.height;

                // Sharpen kernel
                //  0 -1  0
                // -1  5 -1
                //  0 -1  0
                const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

                // We'll create a new buffer to store sharpened data so we don't read modified pixels
                const outputBuffer = new Uint8ClampedArray(data.length);

                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const sy = y;
                        const sx = x;
                        const dstOff = (y * w + x) * 4;

                        let r = 0, g = 0, b = 0;

                        // Apply kernel
                        for (let cy = 0; cy < 3; cy++) {
                            for (let cx = 0; cx < 3; cx++) {
                                const ky = sy + cy - 1;
                                const kx = sx + cx - 1;

                                // Clamp coordinates
                                const scy = Math.min(h - 1, Math.max(0, ky));
                                const scx = Math.min(w - 1, Math.max(0, kx));

                                const srcOff = (scy * w + scx) * 4;
                                const wt = kernel[cy * 3 + cx];

                                r += data[srcOff] * wt;
                                g += data[srcOff + 1] * wt;
                                b += data[srcOff + 2] * wt;
                            }
                        }

                        outputBuffer[dstOff] = r;
                        outputBuffer[dstOff + 1] = g;
                        outputBuffer[dstOff + 2] = b;
                        outputBuffer[dstOff + 3] = data[dstOff + 3]; // Copy Alpha
                    }
                }

                // Put sharpened data back
                imageData.data.set(outputBuffer);
                ctx.putImageData(imageData, 0, 0);

                // --- CONVERT TO WEBP & COMPRESS ---
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const processedFile = new File(
                                [blob],
                                file.name.replace(/\.[^.]+$/, "") + ".webp",
                                { type: "image/webp" }
                            );
                            resolve(processedFile);
                        } else {
                            resolve(file); // Fallback
                        }
                    },
                    "image/webp",
                    0.8 // Quality 80% (High compression without much visual loss)
                );
            };
            img.onerror = (e) => reject(e);
        };
        reader.onerror = (e) => reject(e);
    });
}
