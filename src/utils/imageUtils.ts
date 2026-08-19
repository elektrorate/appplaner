/**
 * Utility to compress and downscale images before storing in memory / localStorage.
 * Converts large screenshots and photos to optimized lightweight JPEG/WebP data URLs.
 */

export async function compressImage(
  fileOrBlob: Blob | File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions keeping aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const rawUrl = e.target?.result as string;
          resolve({ dataUrl: rawUrl, size: fileOrBlob.size });
          return;
        }

        // Draw image smoothly
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG format
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Approximate size in bytes from base64 length
        const head = 'data:image/jpeg;base64,';
        const base64Length = compressedDataUrl.length - head.length;
        const approximateSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl: compressedDataUrl,
          size: approximateSize,
        });
      };

      img.onerror = () => {
        const rawUrl = e.target?.result as string;
        resolve({ dataUrl: rawUrl, size: fileOrBlob.size });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      resolve({ dataUrl: '', size: 0 });
    };

    reader.readAsDataURL(fileOrBlob);
  });
}
