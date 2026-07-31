export const compressImage = (
  fileOrDataUrl: File | string,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If it's SVG string or SVG data url, return directly if reasonable size
    if (typeof fileOrDataUrl === 'string') {
      if (fileOrDataUrl.includes('image/svg+xml') || fileOrDataUrl.trim().startsWith('<svg')) {
        return resolve(fileOrDataUrl);
      }
    } else if (fileOrDataUrl.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
      return;
    }

    const img = new Image();

    const processImage = () => {
      let width = img.width;
      let height = img.height;

      if (!width || !height) {
        return resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
      }

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(typeof fileOrDataUrl === 'string' ? fileOrDataUrl : '');
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Export compressed JPEG
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onload = processImage;
    img.onerror = (err) => {
      console.warn('Image load error during compression, returning raw input if string:', err);
      if (typeof fileOrDataUrl === 'string') {
        resolve(fileOrDataUrl);
      } else {
        reject(err);
      }
    };

    if (typeof fileOrDataUrl === 'string') {
      img.src = fileOrDataUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
};
