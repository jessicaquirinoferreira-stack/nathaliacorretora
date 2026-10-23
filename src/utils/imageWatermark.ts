/**
 * Utility for client-side image resizing and automatic luxury watermarking.
 * Works seamlessly on Windows, Mac, Android, iOS and all browsers.
 * Preserves the transparent background of the official Nathalia Robadey Imóveis logo.
 */

const WATERMARK_SRC = '/logo-nathalia-robadey.png';
const WATERMARK_FALLBACK_URL = 'https://i.postimg.cc/zfsH2LJH/Logo-imobiliario-NR-dourado-e-azul-marinho.png';

let cachedWatermarkImg: HTMLImageElement | null = null;

function loadWatermarkImage(): Promise<HTMLImageElement> {
  if (cachedWatermarkImg && cachedWatermarkImg.complete) {
    return Promise.resolve(cachedWatermarkImg);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      cachedWatermarkImg = img;
      resolve(img);
    };

    img.onerror = () => {
      // Fallback to external official URL
      const fallbackImg = new Image();
      fallbackImg.crossOrigin = 'anonymous';
      fallbackImg.onload = () => {
        cachedWatermarkImg = fallbackImg;
        resolve(fallbackImg);
      };
      fallbackImg.onerror = () => {
        // If image completely fails to load, create an inline canvas watermark
        resolve(createFallbackWatermarkBadge());
      };
      fallbackImg.src = WATERMARK_FALLBACK_URL;
    };

    img.src = WATERMARK_SRC;
  });
}

function createFallbackWatermarkBadge(): HTMLImageElement {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 120;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'rgba(11, 25, 44, 0.85)';
  ctx.roundRect(10, 10, 380, 100, 12);
  ctx.fill();

  ctx.strokeStyle = '#C5A059';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.fillText('NATHALIA ROBADEY', 200, 52);

  ctx.fillStyle = '#C5A059';
  ctx.font = '14px sans-serif';
  ctx.fillText('IMÓVEIS DE ALTO PADRÃO', 200, 80);

  const img = new Image();
  img.src = canvas.toDataURL();
  return img;
}

export interface WatermarkOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  position?: 'bottom-right' | 'bottom-left' | 'center';
  opacity?: number;
}

export async function processAndWatermarkPhoto(
  file: File,
  options: WatermarkOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1280,
    quality = 0.88,
    position = 'bottom-right',
    opacity = 0.88
  } = options;

  // 1. Load original photo
  const photoBitmap = await createImageBitmap(file).catch(async () => {
    // Fallback using traditional HTMLImageElement for Safari/older mobile
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  });

  const origWidth = photoBitmap.width;
  const origHeight = photoBitmap.height;

  // 2. Calculate optimal architectural dimensions (prevent distortion, keep aspect ratio)
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (targetWidth > maxWidth || targetHeight > maxHeight) {
    const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  // 3. Create canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) throw new Error('Não foi possível obter contexto do canvas 2D.');

  // High quality interpolation
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 4. Draw base photo
  ctx.drawImage(photoBitmap, 0, 0, targetWidth, targetHeight);

  // 5. Load and apply official watermark
  try {
    const watermark = await loadWatermarkImage();

    // Scale watermark to be ~18% of the photo's width (balanced and elegant)
    const wmTargetWidth = Math.max(140, Math.min(Math.round(targetWidth * 0.18), 340));
    const wmAspect = watermark.height / watermark.width;
    const wmTargetHeight = Math.round(wmTargetWidth * wmAspect);

    // Padding from edge
    const padding = Math.max(20, Math.round(targetWidth * 0.025));

    let x = targetWidth - wmTargetWidth - padding;
    let y = targetHeight - wmTargetHeight - padding;

    if (position === 'center') {
      x = (targetWidth - wmTargetWidth) / 2;
      y = (targetHeight - wmTargetHeight) / 2;
    } else if (position === 'bottom-left') {
      x = padding;
      y = targetHeight - wmTargetHeight - padding;
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    // Subtle dark luxury glow behind watermark so it stands out on any photo tone
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Draw watermark respecting full PNG transparency
    ctx.drawImage(watermark, x, y, wmTargetWidth, wmTargetHeight);
    ctx.restore();
  } catch (err) {
    console.warn('[Watermark] Failed to render watermark, continuing with resized photo:', err);
  }

  // 6. Export to high-quality JPEG
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  if (!blob) throw new Error('Falha ao processar arquivo de imagem.');

  const cleanName = file.name.replace(/\.[^/.]+$/, '') + '-nri.jpg';
  return new File([blob], cleanName, { type: 'image/jpeg', lastModified: Date.now() });
}
