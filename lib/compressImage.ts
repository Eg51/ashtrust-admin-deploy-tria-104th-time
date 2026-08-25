// app/lib/compressImage.ts

/**
 * Compress an image to under 100KB
 * @param file - The image file to compress
 * @param maxSizeKB - Maximum size in KB (default: 100)
 * @param maxDimension - Maximum width/height (default: 400)
 * @returns Promise<string> - Compressed image as base64 data URL
 */
export async function compressImage(
  file: File,
  maxSizeKB: number = 100,
  maxDimension: number = 400
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      try {
        const img = new Image();
        img.src = event.target?.result as string;
        
        img.onload = () => {
          try {
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;
            
            // Resize if too large
            if (width > height) {
              if (width > maxDimension) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }
            
            // Create canvas and draw resized image
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Start with high quality and reduce until under 100KB
            let quality = 0.85;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);
            
            // Reduce quality until under maxSizeKB
            while (dataUrl.length > maxSizeKB * 1024 && quality > 0.1) {
              quality -= 0.05;
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
            
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
}

/**
 * Get image size in KB
 */
export function getImageSizeKB(base64String: string): number {
  const base64Length = base64String.length - (base64String.indexOf(',') + 1);
  const padding = (base64String.endsWith('==')) ? 2 : (base64String.endsWith('=')) ? 1 : 0;
  const sizeInBytes = (base64Length * 3 / 4) - padding;
  return Math.round(sizeInBytes / 1024);
}