export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ProcessedResult {
  objects: Rect[];
  gap: Rect | null;
  gapWidth: number | null;
  gapHeight: number | null;
  gapWidthMm: number | null;
  gapHeightMm: number | null;
}

export interface ThresholdConfig {
  binarizationThreshold: number;
  minObjectSize: number;
  maxGapWidth: number;
  dpi: number;
}