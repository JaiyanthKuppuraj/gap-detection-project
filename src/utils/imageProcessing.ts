import { Rect, ProcessedResult, ThresholdConfig } from '../types';

// Convert pixels to millimeters
const pixelsToMm = (pixels: number, dpi: number): number => {
  const inches = pixels / dpi;
  return inches * 25.4; // 1 inch = 25.4mm
};

// Convert image to grayscale
export const toGrayscale = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number
): ImageData => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Convert to grayscale using luminance method
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    data[i] = data[i + 1] = data[i + 2] = gray;
  }
  
  return imageData;
};

// Binarize image using threshold
export const binarize = (
  imageData: ImageData, 
  threshold: number
): ImageData => {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    // Apply threshold
    const value = gray < threshold ? 0 : 255;
    data[i] = data[i + 1] = data[i + 2] = value;
  }
  
  return imageData;
};

// Find connected components using flood fill
export const findConnectedComponents = (
  imageData: ImageData, 
  width: number, 
  height: number,
  minSize: number
): Rect[] => {
  const data = imageData.data;
  const visited = new Set<number>();
  const components: Rect[] = [];

  const isBlackPixel = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const pos = (y * width + x) * 4;
    return data[pos] === 0;
  };

  const floodFill = (startX: number, startY: number): Rect | null => {
    const stack: [number, number][] = [[startX, startY]];
    let minX = startX, maxX = startX;
    let minY = startY, maxY = startY;
    let pixelCount = 0;

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const pos = (y * width + x) * 4;
      
      if (visited.has(pos)) continue;
      visited.add(pos);
      
      if (!isBlackPixel(x, y)) continue;
      
      pixelCount++;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);

      // Check 4-connected neighbors
      if (x > 0) stack.push([x - 1, y]);
      if (x < width - 1) stack.push([x + 1, y]);
      if (y > 0) stack.push([x, y - 1]);
      if (y < height - 1) stack.push([x, y + 1]);
    }

    if (pixelCount < minSize) return null;

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1
    };
  };

  // Scan the image for unvisited black pixels
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = (y * width + x) * 4;
      if (!visited.has(pos) && isBlackPixel(x, y)) {
        const component = floodFill(x, y);
        if (component) {
          components.push(component);
        }
      }
    }
  }

  return components;
};

// Find the gap between two objects
export const findGapBetweenObjects = (
  objects: Rect[],
  maxGapWidth: number,
  dpi: number
): { gap: Rect | null; gapWidth: number | null; gapHeight: number | null; gapWidthMm: number | null; gapHeightMm: number | null } => {
  if (objects.length !== 2) {
    return { gap: null, gapWidth: null, gapHeight: null, gapWidthMm: null, gapHeightMm: null };
  }
  
  // Sort objects by x position
  const sortedObjects = [...objects].sort((a, b) => a.x - b.x);
  const [left, right] = sortedObjects;
  
  // Calculate horizontal gap
  const gapWidth = right.x - (left.x + left.width);
  
  // Only process if the gap isn't too large and is positive
  if (gapWidth <= 0 || gapWidth > maxGapWidth) {
    return { gap: null, gapWidth: null, gapHeight: null, gapWidthMm: null, gapHeightMm: null };
  }
  
  // Find overlapping y range
  const leftBottom = left.y + left.height;
  const rightBottom = right.y + right.height;
  
  const overlapTop = Math.max(left.y, right.y);
  const overlapBottom = Math.min(leftBottom, rightBottom);
  
  // Create gap rectangle using full height range instead of overlap
  const gapTop = Math.min(left.y, right.y);
  const gapBottom = Math.max(leftBottom, rightBottom);
  const gapHeight = gapBottom - gapTop;
  
  // Convert measurements to millimeters
  const gapWidthMm = pixelsToMm(gapWidth, dpi);
  const gapHeightMm = pixelsToMm(gapHeight, dpi);
  
  // Create gap rectangle
  const gap: Rect = {
    x: left.x + left.width,
    y: gapTop,
    width: gapWidth,
    height: gapHeight
  };
  
  return { gap, gapWidth, gapHeight, gapWidthMm, gapHeightMm };
};

// Process image and find objects and gap
export const processImage = (
  imageCanvas: HTMLCanvasElement,
  config: ThresholdConfig
): ProcessedResult => {
  const { binarizationThreshold, minObjectSize, maxGapWidth, dpi } = config;
  const ctx = imageCanvas.getContext('2d', { willReadFrequently: true });
  
  if (!ctx) {
    return { 
      objects: [], 
      gap: null, 
      gapWidth: null, 
      gapHeight: null,
      gapWidthMm: null,
      gapHeightMm: null
    };
  }
  
  const width = imageCanvas.width;
  const height = imageCanvas.height;
  
  // Convert to grayscale
  let imageData = toGrayscale(ctx, width, height);
  
  // Binarize
  imageData = binarize(imageData, binarizationThreshold);
  
  // Put processed image back to canvas for debugging
  ctx.putImageData(imageData, 0, 0);
  
  // Find objects
  const objects = findConnectedComponents(imageData, width, height, minObjectSize);
  
  // Find gap between objects
  const { gap, gapWidth, gapHeight, gapWidthMm, gapHeightMm } = findGapBetweenObjects(objects, maxGapWidth, dpi);
  
  return { objects, gap, gapWidth, gapHeight, gapWidthMm, gapHeightMm };
};