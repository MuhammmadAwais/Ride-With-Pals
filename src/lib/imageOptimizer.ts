/**
 * Client-side image optimization utility.
 * Resizes and compresses images in the browser before sending them over the network.
 * Reduces 5MB-10MB mobile/camera images down to ~100KB-250KB in milliseconds,
 * eliminating timeout errors and speeding up upload performance.
 */
export async function optimizeImageForUpload(
  file: File,
  maxDimension = 1200,
  quality = 0.85
): Promise<File> {
  // If not a standard raster image (e.g. svg, gpx, non-image), return original
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      // Only downscale if dimensions exceed maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const fileName = file.name.replace(/\.[^/.]+$/, outputType === 'image/png' ? '.png' : '.jpg');
            const optimizedFile = new File([blob], fileName, {
              type: outputType,
              lastModified: Date.now(),
            });
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}
