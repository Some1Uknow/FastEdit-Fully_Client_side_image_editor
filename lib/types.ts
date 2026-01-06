// Core types for the image editor

export type Tool =
  | "select"
  | "crop"
  | "adjustments"
  | "filters"
  | "draw"
  | "text"
  | "shapes"
  | "export";

export type ShapeType =
  | "rectangle"
  | "circle"
  | "triangle"
  | "line"
  | "arrow"
  | "star";

export type AspectRatio =
  | "free"
  | "1:1"
  | "16:9"
  | "9:16"
  | "4:3"
  | "3:4"
  | "3:2"
  | "2:3";

export type ExportFormat = "png" | "jpeg" | "webp";

export interface Point {
  x: number;
  y: number;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Adjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  exposure: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  temperature: number; // -100 to 100
  tint: number; // -100 to 100
  vibrance: number; // -100 to 100
  sharpness: number; // 0 to 100
  blur: number; // 0 to 100
  vignette: number; // 0 to 100
  hue: number; // -180 to 180
  sepia: number; // 0 to 100
  grayscale: number; // 0 to 100
  invert: number; // 0 to 100
}

export interface FilterPreset {
  id: string;
  name: string;
  adjustments: Partial<Adjustments>;
}

export interface Transform {
  rotation: number; // degrees
  flipX: boolean;
  flipY: boolean;
}

export interface DrawingPath {
  id: string;
  points: Point[];
  color: string;
  size: number;
  tool: "brush" | "eraser";
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
}

export interface ShapeOverlay {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: boolean;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface HistoryState {
  adjustments: Adjustments;
  transform: Transform;
  drawingPaths: DrawingPath[];
  texts: TextOverlay[];
  shapes: ShapeOverlay[];
  cropRect: CropRect | null;
}

export interface DrawingSettings {
  tool: "brush" | "eraser";
  color: string;
  size: number;
}

export interface TextSettings {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  align: "left" | "center" | "right";
}

export interface ShapeSettings {
  type: ShapeType;
  fill: boolean;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface ExportSettings {
  format: ExportFormat;
  quality: number; // 0-100 for jpeg/webp
  scale: number; // 0.5x, 1x, 2x, 3x
}

export const DEFAULT_ADJUSTMENTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  temperature: 0,
  tint: 0,
  vibrance: 0,
  sharpness: 0,
  blur: 0,
  vignette: 0,
  hue: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
};
