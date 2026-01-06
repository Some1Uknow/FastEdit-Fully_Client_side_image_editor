"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import {
  Tool,
  Adjustments,
  Transform,
  CropRect,
  DrawingPath,
  TextOverlay,
  ShapeOverlay,
  DrawingSettings,
  TextSettings,
  ShapeSettings,
  AspectRatio,
} from "@/lib/types";
import { getFilterString } from "@/lib/filters";

// Draw shape helper function (defined outside component to avoid hoisting issues)
function drawShape(ctx: CanvasRenderingContext2D, shape: ShapeOverlay) {
  ctx.save();
  ctx.strokeStyle = shape.strokeColor;
  ctx.lineWidth = shape.strokeWidth;
  ctx.fillStyle = shape.fillColor;

  switch (shape.type) {
    case "rectangle":
      if (shape.fill) {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      }
      ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      break;

    case "circle":
      const radiusX = shape.width / 2;
      const radiusY = shape.height / 2;
      ctx.beginPath();
      ctx.ellipse(
        shape.x + radiusX,
        shape.y + radiusY,
        Math.abs(radiusX),
        Math.abs(radiusY),
        0,
        0,
        Math.PI * 2
      );
      if (shape.fill) ctx.fill();
      ctx.stroke();
      break;

    case "triangle":
      ctx.beginPath();
      ctx.moveTo(shape.x + shape.width / 2, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
      ctx.lineTo(shape.x, shape.y + shape.height);
      ctx.closePath();
      if (shape.fill) ctx.fill();
      ctx.stroke();
      break;

    case "line":
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
      ctx.stroke();
      break;

    case "arrow":
      const headLength = 15;
      const angle = Math.atan2(shape.height, shape.width);
      const endX = shape.x + shape.width;
      const endY = shape.y + shape.height;

      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(endX, endY);
      ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
      break;

    case "star":
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      const outerRadius = Math.min(shape.width, shape.height) / 2;
      const innerRadius = outerRadius * 0.4;
      const spikes = 5;

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const a = (Math.PI / 2) * 3 + (i * Math.PI) / spikes;
        const x = cx + Math.cos(a) * radius;
        const y = cy + Math.sin(a) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      if (shape.fill) ctx.fill();
      ctx.stroke();
      break;
  }

  ctx.restore();
}

interface CanvasProps {
  image: HTMLImageElement | null;
  adjustments: Adjustments;
  transform: Transform;
  activeTool: Tool;
  zoom: number;
  pan: { x: number; y: number };
  onPanChange: (pan: { x: number; y: number }) => void;
  cropRect: CropRect | null;
  onCropRectChange: (rect: CropRect | null) => void;
  aspectRatio: AspectRatio;
  drawingPaths: DrawingPath[];
  onAddDrawingPath: (path: DrawingPath) => void;
  drawingSettings: DrawingSettings;
  texts: TextOverlay[];
  onAddText: (text: TextOverlay) => void;
  onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  textSettings: TextSettings;
  shapes: ShapeOverlay[];
  onAddShape: (shape: ShapeOverlay) => void;
  onUpdateShape: (id: string, updates: Partial<ShapeOverlay>) => void;
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
  shapeSettings: ShapeSettings;
}

export function Canvas({
  image,
  adjustments,
  transform,
  activeTool,
  zoom,
  pan,
  onPanChange,
  cropRect,
  onCropRectChange,
  aspectRatio,
  drawingPaths,
  onAddDrawingPath,
  drawingSettings,
  texts,
  onAddText,
  onUpdateText,
  selectedTextId,
  onSelectText,
  textSettings,
  shapes,
  onAddShape,
  onUpdateShape,
  selectedShapeId,
  onSelectShape,
  shapeSettings,
}: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<ShapeOverlay | null>(null);
  const [draggingText, setDraggingText] = useState<string | null>(null);
  const [draggingShape, setDraggingShape] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [cropHandle, setCropHandle] = useState<string | null>(null);
  const [initialCropRect, setInitialCropRect] = useState<CropRect | null>(null);

  // Render main canvas
  useEffect(() => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to image size
    canvas.width = image.width;
    canvas.height = image.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transform
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Apply filters
    ctx.filter = getFilterString(adjustments);

    // Draw image
    ctx.drawImage(image, 0, 0);

    // Restore context
    ctx.restore();

    // Apply vignette effect (after main image, before overlays)
    if (adjustments.vignette > 0) {
      const vignetteStrength = adjustments.vignette / 100;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = Math.max(canvas.width, canvas.height) * 0.7;
      
      const gradient = ctx.createRadialGradient(
        centerX, centerY, radius * (1 - vignetteStrength * 0.5),
        centerX, centerY, radius
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${vignetteStrength * 0.8})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Apply sharpness effect using unsharp mask technique
    if (adjustments.sharpness > 0) {
      const sharpnessAmount = adjustments.sharpness / 100;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;
      
      // Create a copy for the blur
      const blurData = new Uint8ClampedArray(data);
      
      // Simple 3x3 box blur for the mask
      const kernel = 1 / 9;
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          for (let c = 0; c < 3; c++) {
            let sum = 0;
            for (let ky = -1; ky <= 1; ky++) {
              for (let kx = -1; kx <= 1; kx++) {
                const kidx = ((y + ky) * width + (x + kx)) * 4 + c;
                sum += data[kidx];
              }
            }
            blurData[idx + c] = sum * kernel;
          }
        }
      }
      
      // Apply unsharp mask: original + (original - blur) * amount
      const amount = sharpnessAmount * 2;
      for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
          const diff = data[i + c] - blurData[i + c];
          data[i + c] = Math.min(255, Math.max(0, data[i + c] + diff * amount));
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }

    // Draw overlays (drawings, shapes, text) without filters
    ctx.filter = "none";

    // Draw paths
    drawingPaths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);

      // Use quadratic curves for smoother lines
      for (let i = 1; i < path.points.length - 1; i++) {
        const xc = (path.points[i].x + path.points[i + 1].x) / 2;
        const yc = (path.points[i].y + path.points[i + 1].y) / 2;
        ctx.quadraticCurveTo(path.points[i].x, path.points[i].y, xc, yc);
      }

      // Last point
      if (path.points.length > 1) {
        const lastPoint = path.points[path.points.length - 1];
        ctx.lineTo(lastPoint.x, lastPoint.y);
      }

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation =
        path.tool === "eraser" ? "destination-out" : "source-over";
      ctx.stroke();
    });

    ctx.globalCompositeOperation = "source-over";

    // Draw shapes
    shapes.forEach((shape) => {
      drawShape(ctx, shape);
    });

    // Draw current shape being drawn
    if (currentShape) {
      drawShape(ctx, currentShape);
    }

    // Draw text overlays
    texts.forEach((text) => {
      ctx.save();
      ctx.font = `${text.italic ? "italic " : ""}${text.bold ? "bold " : ""}${
        text.fontSize
      }px ${text.fontFamily}`;
      ctx.fillStyle = text.color;
      ctx.textAlign = text.align;
      ctx.textBaseline = "top";

      const lines = text.text.split("\n");
      lines.forEach((line, index) => {
        ctx.fillText(line, text.x, text.y + index * text.fontSize * 1.2);
      });
      ctx.restore();
    });
  }, [
    image,
    adjustments,
    transform,
    drawingPaths,
    texts,
    shapes,
    currentShape,
  ]);

  // Render overlay canvas (crop, selection)
  useEffect(() => {
    if (!overlayCanvasRef.current || !image) return;

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = image.width;
    canvas.height = image.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw crop overlay
    if (activeTool === "crop" && cropRect) {
      // Darken outside crop area
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear crop area
      ctx.clearRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);

      // Draw crop border
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.width, cropRect.height);

      // Draw rule of thirds
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = 1;

      const thirdW = cropRect.width / 3;
      const thirdH = cropRect.height / 3;

      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(cropRect.x + thirdW * i, cropRect.y);
        ctx.lineTo(cropRect.x + thirdW * i, cropRect.y + cropRect.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cropRect.x, cropRect.y + thirdH * i);
        ctx.lineTo(cropRect.x + cropRect.width, cropRect.y + thirdH * i);
        ctx.stroke();
      }

      // Draw corner handles
      const handleSize = 12;
      ctx.fillStyle = "white";

      const corners = [
        { x: cropRect.x, y: cropRect.y, cursor: "nw" },
        { x: cropRect.x + cropRect.width, y: cropRect.y, cursor: "ne" },
        { x: cropRect.x, y: cropRect.y + cropRect.height, cursor: "sw" },
        { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height, cursor: "se" },
      ];

      corners.forEach((corner) => {
        ctx.fillRect(
          corner.x - handleSize / 2,
          corner.y - handleSize / 2,
          handleSize,
          handleSize
        );
      });

      // Draw edge handles
      const edgeHandleSize = 8;
      const edges = [
        { x: cropRect.x + cropRect.width / 2, y: cropRect.y, cursor: "n" },
        { x: cropRect.x + cropRect.width / 2, y: cropRect.y + cropRect.height, cursor: "s" },
        { x: cropRect.x, y: cropRect.y + cropRect.height / 2, cursor: "w" },
        { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height / 2, cursor: "e" },
      ];

      edges.forEach((edge) => {
        ctx.fillRect(
          edge.x - edgeHandleSize / 2,
          edge.y - edgeHandleSize / 2,
          edgeHandleSize,
          edgeHandleSize
        );
      });
    }

    // Draw text selection
    if (selectedTextId) {
      const text = texts.find((t) => t.id === selectedTextId);
      if (text) {
        ctx.save();
        ctx.font = `${text.italic ? "italic " : ""}${text.bold ? "bold " : ""}${
          text.fontSize
        }px ${text.fontFamily}`;

        const metrics = ctx.measureText(text.text);
        const width = metrics.width;
        const height = text.fontSize * 1.2;

        let x = text.x;
        if (text.align === "center") x -= width / 2;
        else if (text.align === "right") x -= width;

        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(x - 4, text.y - 4, width + 8, height + 8);
        ctx.restore();
      }
    }

    // Draw shape selection
    if (selectedShapeId) {
      const shape = shapes.find((s) => s.id === selectedShapeId);
      if (shape) {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          shape.x - 4,
          shape.y - 4,
          shape.width + 8,
          shape.height + 8
        );
      }
    }
  }, [
    image,
    activeTool,
    cropRect,
    selectedTextId,
    texts,
    selectedShapeId,
    shapes,
  ]);

  // FIXED: Get canvas coordinates from mouse or touch event with proper transformation
  const getCanvasCoords = useCallback(
    (e: React.MouseEvent | MouseEvent | React.TouchEvent | TouchEvent | { clientX: number; clientY: number }) => {
      if (!canvasWrapperRef.current || !canvasRef.current || !image) {
        return { x: 0, y: 0 };
      }

      // Get the canvas wrapper's bounding rect (this is the transformed element)
      const wrapperRect = canvasWrapperRef.current.getBoundingClientRect();
      
      // Calculate the scale factor from the displayed size to the actual canvas size
      const scaleX = image.width / wrapperRect.width;
      const scaleY = image.height / wrapperRect.height;

      // Get client coordinates from mouse or touch event
      let clientX: number, clientY: number;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('changedTouches' in e && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else {
        return { x: 0, y: 0 };
      }

      // Get position relative to the wrapper
      const mouseX = clientX - wrapperRect.left;
      const mouseY = clientY - wrapperRect.top;

      // Convert to canvas coordinates
      const x = mouseX * scaleX;
      const y = mouseY * scaleY;

      // Clamp to canvas bounds
      return {
        x: Math.max(0, Math.min(image.width, x)),
        y: Math.max(0, Math.min(image.height, y)),
      };
    },
    [image]
  );

  // Check if point is near a crop handle
  const getCropHandle = useCallback(
    (coords: { x: number; y: number }): string | null => {
      if (!cropRect) return null;

      const handleSize = 20; // Larger hit area for easier interaction

      const handles = [
        { x: cropRect.x, y: cropRect.y, name: "nw" },
        { x: cropRect.x + cropRect.width, y: cropRect.y, name: "ne" },
        { x: cropRect.x, y: cropRect.y + cropRect.height, name: "sw" },
        { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height, name: "se" },
        { x: cropRect.x + cropRect.width / 2, y: cropRect.y, name: "n" },
        { x: cropRect.x + cropRect.width / 2, y: cropRect.y + cropRect.height, name: "s" },
        { x: cropRect.x, y: cropRect.y + cropRect.height / 2, name: "w" },
        { x: cropRect.x + cropRect.width, y: cropRect.y + cropRect.height / 2, name: "e" },
      ];

      for (const handle of handles) {
        if (
          Math.abs(coords.x - handle.x) < handleSize &&
          Math.abs(coords.y - handle.y) < handleSize
        ) {
          return handle.name;
        }
      }

      // Check if inside crop rect for moving
      if (
        coords.x > cropRect.x &&
        coords.x < cropRect.x + cropRect.width &&
        coords.y > cropRect.y &&
        coords.y < cropRect.y + cropRect.height
      ) {
        return "move";
      }

      return null;
    },
    [cropRect]
  );

  // Get aspect ratio value
  const getAspectRatioValue = useCallback(() => {
    if (aspectRatio === "free") return null;
    const [w, h] = aspectRatio.split(":").map(Number);
    return w / h;
  }, [aspectRatio]);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!image) return;

      const coords = getCanvasCoords(e);

      // Check if clicking on text
      if (activeTool === "text" || activeTool === "select") {
        for (const text of texts) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          ctx.font = `${text.italic ? "italic " : ""}${text.bold ? "bold " : ""}${
            text.fontSize
          }px ${text.fontFamily}`;
          const metrics = ctx.measureText(text.text);
          const width = metrics.width;
          const height = text.fontSize * 1.2;

          let x = text.x;
          if (text.align === "center") x -= width / 2;
          else if (text.align === "right") x -= width;

          if (
            coords.x >= x &&
            coords.x <= x + width &&
            coords.y >= text.y &&
            coords.y <= text.y + height
          ) {
            onSelectText(text.id);
            setDraggingText(text.id);
            setDragOffset({ x: coords.x - text.x, y: coords.y - text.y });
            return;
          }
        }
      }

      // Check if clicking on shape
      if (activeTool === "shapes" || activeTool === "select") {
        for (const shape of shapes) {
          if (
            coords.x >= shape.x &&
            coords.x <= shape.x + shape.width &&
            coords.y >= shape.y &&
            coords.y <= shape.y + shape.height
          ) {
            onSelectShape(shape.id);
            setDraggingShape(shape.id);
            setDragOffset({ x: coords.x - shape.x, y: coords.y - shape.y });
            return;
          }
        }
      }

      // Deselect
      onSelectText(null);
      onSelectShape(null);

      switch (activeTool) {
        case "select":
          setIsPanning(true);
          setLastPanPoint({ x: e.clientX, y: e.clientY });
          break;

        case "crop":
          // Check if clicking on existing crop handle
          if (cropRect) {
            const handle = getCropHandle(coords);
            if (handle) {
              setCropHandle(handle);
              setInitialCropRect({ ...cropRect });
              setCropStart(coords);
              return;
            }
          }
          // Start new crop
          setCropStart(coords);
          setCropHandle(null);
          setInitialCropRect(null);
          onCropRectChange(null);
          break;

        case "draw":
          setIsDrawing(true);
          setCurrentPath([coords]);
          break;

        case "text":
          // Add new text at click position
          const newText: TextOverlay = {
            id: `text-${Date.now()}`,
            text: textSettings.text || "Double click to edit",
            x: coords.x,
            y: coords.y,
            fontSize: textSettings.fontSize,
            fontFamily: textSettings.fontFamily,
            color: textSettings.color,
            bold: textSettings.bold,
            italic: textSettings.italic,
            align: textSettings.align,
          };
          onAddText(newText);
          onSelectText(newText.id);
          break;

        case "shapes":
          setShapeStart(coords);
          break;
      }
    },
    [
      image,
      activeTool,
      texts,
      shapes,
      cropRect,
      getCanvasCoords,
      getCropHandle,
      textSettings,
      onAddText,
      onSelectText,
      onSelectShape,
      onCropRectChange,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!image) return;

      const coords = getCanvasCoords(e);

      // Handle text dragging
      if (draggingText) {
        onUpdateText(draggingText, {
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y,
        });
        return;
      }

      // Handle shape dragging
      if (draggingShape) {
        onUpdateShape(draggingShape, {
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y,
        });
        return;
      }

      if (isPanning) {
        const dx = e.clientX - lastPanPoint.x;
        const dy = e.clientY - lastPanPoint.y;
        onPanChange({ x: pan.x + dx, y: pan.y + dy });
        setLastPanPoint({ x: e.clientX, y: e.clientY });
        return;
      }

      // Handle crop resize/move
      if (activeTool === "crop" && cropStart && cropHandle && initialCropRect) {
        const dx = coords.x - cropStart.x;
        const dy = coords.y - cropStart.y;
        const ratio = getAspectRatioValue();

        const newRect = { ...initialCropRect };

        switch (cropHandle) {
          case "move":
            newRect.x = Math.max(0, Math.min(image.width - newRect.width, initialCropRect.x + dx));
            newRect.y = Math.max(0, Math.min(image.height - newRect.height, initialCropRect.y + dy));
            break;
          case "nw":
            newRect.x = initialCropRect.x + dx;
            newRect.y = initialCropRect.y + dy;
            newRect.width = initialCropRect.width - dx;
            newRect.height = initialCropRect.height - dy;
            break;
          case "ne":
            newRect.y = initialCropRect.y + dy;
            newRect.width = initialCropRect.width + dx;
            newRect.height = initialCropRect.height - dy;
            break;
          case "sw":
            newRect.x = initialCropRect.x + dx;
            newRect.width = initialCropRect.width - dx;
            newRect.height = initialCropRect.height + dy;
            break;
          case "se":
            newRect.width = initialCropRect.width + dx;
            newRect.height = initialCropRect.height + dy;
            break;
          case "n":
            newRect.y = initialCropRect.y + dy;
            newRect.height = initialCropRect.height - dy;
            break;
          case "s":
            newRect.height = initialCropRect.height + dy;
            break;
          case "w":
            newRect.x = initialCropRect.x + dx;
            newRect.width = initialCropRect.width - dx;
            break;
          case "e":
            newRect.width = initialCropRect.width + dx;
            break;
        }

        // Apply aspect ratio constraint
        if (ratio && cropHandle !== "move") {
          if (cropHandle.includes("e") || cropHandle.includes("w")) {
            newRect.height = newRect.width / ratio;
          } else {
            newRect.width = newRect.height * ratio;
          }
        }

        // Ensure minimum size
        if (newRect.width >= 20 && newRect.height >= 20) {
          // Clamp to image bounds
          newRect.x = Math.max(0, newRect.x);
          newRect.y = Math.max(0, newRect.y);
          newRect.width = Math.min(newRect.width, image.width - newRect.x);
          newRect.height = Math.min(newRect.height, image.height - newRect.y);
          
          onCropRectChange(newRect);
        }
        return;
      }

      // Handle new crop creation
      if (activeTool === "crop" && cropStart && !cropHandle) {
        let width = coords.x - cropStart.x;
        let height = coords.y - cropStart.y;

        const ratio = getAspectRatioValue();
        if (ratio) {
          if (Math.abs(width) > Math.abs(height)) {
            height = Math.sign(height || 1) * Math.abs(width) / ratio;
          } else {
            width = Math.sign(width || 1) * Math.abs(height) * ratio;
          }
        }

        // Calculate proper rect regardless of drag direction
        const x = width > 0 ? cropStart.x : cropStart.x + width;
        const y = height > 0 ? cropStart.y : cropStart.y + height;
        const w = Math.abs(width);
        const h = Math.abs(height);

        // Clamp to image bounds
        const clampedX = Math.max(0, x);
        const clampedY = Math.max(0, y);
        const clampedW = Math.min(w, image.width - clampedX);
        const clampedH = Math.min(h, image.height - clampedY);

        if (clampedW > 5 && clampedH > 5) {
          onCropRectChange({
            x: clampedX,
            y: clampedY,
            width: clampedW,
            height: clampedH,
          });
        }
      }

      if (activeTool === "draw" && isDrawing) {
        setCurrentPath((prev) => [...prev, coords]);
      }

      if (activeTool === "shapes" && shapeStart) {
        const width = coords.x - shapeStart.x;
        const height = coords.y - shapeStart.y;

        // Calculate proper rect regardless of drag direction
        const x = width > 0 ? shapeStart.x : shapeStart.x + width;
        const y = height > 0 ? shapeStart.y : shapeStart.y + height;

        setCurrentShape({
          id: `shape-${Date.now()}`,
          type: shapeSettings.type,
          x,
          y,
          width: Math.abs(width),
          height: Math.abs(height),
          fill: shapeSettings.fill,
          fillColor: shapeSettings.fillColor,
          strokeColor: shapeSettings.strokeColor,
          strokeWidth: shapeSettings.strokeWidth,
        });
      }
    },
    [
      image,
      isPanning,
      lastPanPoint,
      pan,
      onPanChange,
      activeTool,
      cropStart,
      cropHandle,
      initialCropRect,
      isDrawing,
      shapeStart,
      shapeSettings,
      getCanvasCoords,
      getAspectRatioValue,
      onCropRectChange,
      draggingText,
      draggingShape,
      dragOffset,
      onUpdateText,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setCropStart(null);
    setCropHandle(null);
    setInitialCropRect(null);
    setDraggingText(null);
    setDraggingShape(null);

    if (activeTool === "draw" && isDrawing && currentPath.length > 1) {
      onAddDrawingPath({
        id: `path-${Date.now()}`,
        points: currentPath,
        color: drawingSettings.tool === "eraser" ? "#000" : drawingSettings.color,
        size: drawingSettings.size,
        tool: drawingSettings.tool,
      });
    }

    if (activeTool === "shapes" && currentShape) {
      if (currentShape.width > 5 && currentShape.height > 5) {
        onAddShape(currentShape);
      }
      setCurrentShape(null);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setShapeStart(null);
  }, [
    activeTool,
    isDrawing,
    currentPath,
    drawingSettings,
    onAddDrawingPath,
    currentShape,
    onAddShape,
  ]);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        // Zoom handled by parent
      }
    },
    []
  );

  // Touch handlers for mobile support
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!image || e.touches.length !== 1) return;
      e.preventDefault();
      
      const touch = e.touches[0];
      const coords = getCanvasCoords(touch);

      // Check if clicking on text
      if (activeTool === "text" || activeTool === "select") {
        for (const text of texts) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          ctx.font = `${text.italic ? "italic " : ""}${text.bold ? "bold " : ""}${
            text.fontSize
          }px ${text.fontFamily}`;
          const metrics = ctx.measureText(text.text);
          const width = metrics.width;
          const height = text.fontSize * 1.2;

          let x = text.x;
          if (text.align === "center") x -= width / 2;
          else if (text.align === "right") x -= width;

          if (
            coords.x >= x &&
            coords.x <= x + width &&
            coords.y >= text.y &&
            coords.y <= text.y + height
          ) {
            onSelectText(text.id);
            setDraggingText(text.id);
            setDragOffset({ x: coords.x - text.x, y: coords.y - text.y });
            return;
          }
        }
      }

      // Check if clicking on shape
      if (activeTool === "shapes" || activeTool === "select") {
        for (const shape of shapes) {
          if (
            coords.x >= shape.x &&
            coords.x <= shape.x + shape.width &&
            coords.y >= shape.y &&
            coords.y <= shape.y + shape.height
          ) {
            onSelectShape(shape.id);
            setDraggingShape(shape.id);
            setDragOffset({ x: coords.x - shape.x, y: coords.y - shape.y });
            return;
          }
        }
      }

      // Deselect
      onSelectText(null);
      onSelectShape(null);

      switch (activeTool) {
        case "select":
          setIsPanning(true);
          setLastPanPoint({ x: touch.clientX, y: touch.clientY });
          break;

        case "crop":
          if (cropRect) {
            const handle = getCropHandle(coords);
            if (handle) {
              setCropHandle(handle);
              setInitialCropRect({ ...cropRect });
              setCropStart(coords);
              return;
            }
          }
          setCropStart(coords);
          setCropHandle(null);
          setInitialCropRect(null);
          onCropRectChange(null);
          break;

        case "draw":
          setIsDrawing(true);
          setCurrentPath([coords]);
          break;

        case "shapes":
          setShapeStart(coords);
          break;
      }
    },
    [
      image,
      activeTool,
      texts,
      shapes,
      cropRect,
      getCanvasCoords,
      getCropHandle,
      onSelectText,
      onSelectShape,
      onCropRectChange,
    ]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!image || e.touches.length !== 1) return;
      e.preventDefault();

      const touch = e.touches[0];
      const coords = getCanvasCoords(touch);

      // Handle text dragging
      if (draggingText) {
        onUpdateText(draggingText, {
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y,
        });
        return;
      }

      // Handle shape dragging
      if (draggingShape) {
        onUpdateShape(draggingShape, {
          x: coords.x - dragOffset.x,
          y: coords.y - dragOffset.y,
        });
        return;
      }

      if (isPanning) {
        const dx = touch.clientX - lastPanPoint.x;
        const dy = touch.clientY - lastPanPoint.y;
        onPanChange({ x: pan.x + dx, y: pan.y + dy });
        setLastPanPoint({ x: touch.clientX, y: touch.clientY });
        return;
      }

      // Handle crop resize/move
      if (activeTool === "crop" && cropStart && cropHandle && initialCropRect) {
        const dx = coords.x - cropStart.x;
        const dy = coords.y - cropStart.y;
        const ratio = getAspectRatioValue();

        const newRect = { ...initialCropRect };

        switch (cropHandle) {
          case "move":
            newRect.x = Math.max(0, Math.min(image.width - newRect.width, initialCropRect.x + dx));
            newRect.y = Math.max(0, Math.min(image.height - newRect.height, initialCropRect.y + dy));
            break;
          case "nw":
            newRect.x = initialCropRect.x + dx;
            newRect.y = initialCropRect.y + dy;
            newRect.width = initialCropRect.width - dx;
            newRect.height = ratio ? newRect.width / ratio : initialCropRect.height - dy;
            break;
          case "ne":
            newRect.y = initialCropRect.y + dy;
            newRect.width = initialCropRect.width + dx;
            newRect.height = ratio ? newRect.width / ratio : initialCropRect.height - dy;
            break;
          case "sw":
            newRect.x = initialCropRect.x + dx;
            newRect.width = initialCropRect.width - dx;
            newRect.height = ratio ? newRect.width / ratio : initialCropRect.height + dy;
            break;
          case "se":
            newRect.width = initialCropRect.width + dx;
            newRect.height = ratio ? newRect.width / ratio : initialCropRect.height + dy;
            break;
          case "n":
            newRect.y = initialCropRect.y + dy;
            newRect.height = initialCropRect.height - dy;
            if (ratio) newRect.width = newRect.height * ratio;
            break;
          case "s":
            newRect.height = initialCropRect.height + dy;
            if (ratio) newRect.width = newRect.height * ratio;
            break;
          case "w":
            newRect.x = initialCropRect.x + dx;
            newRect.width = initialCropRect.width - dx;
            if (ratio) newRect.height = newRect.width / ratio;
            break;
          case "e":
            newRect.width = initialCropRect.width + dx;
            if (ratio) newRect.height = newRect.width / ratio;
            break;
        }

        if (newRect.width > 10 && newRect.height > 10) {
          onCropRectChange({
            x: Math.max(0, newRect.x),
            y: Math.max(0, newRect.y),
            width: Math.min(newRect.width, image.width - newRect.x),
            height: Math.min(newRect.height, image.height - newRect.y),
          });
        }
        return;
      }

      // Handle crop creation
      if (activeTool === "crop" && cropStart && !cropHandle) {
        const x = Math.min(cropStart.x, coords.x);
        const y = Math.min(cropStart.y, coords.y);
        let width = Math.abs(coords.x - cropStart.x);
        let height = Math.abs(coords.y - cropStart.y);

        const ratio = getAspectRatioValue();
        if (ratio) {
          height = width / ratio;
        }

        onCropRectChange({
          x: Math.max(0, x),
          y: Math.max(0, y),
          width: Math.min(width, image.width - x),
          height: Math.min(height, image.height - y),
        });
        return;
      }

      // Handle drawing
      if (activeTool === "draw" && isDrawing) {
        setCurrentPath((prev) => [...prev, coords]);
        return;
      }

      // Handle shape creation
      if (activeTool === "shapes" && shapeStart) {
        const width = coords.x - shapeStart.x;
        const height = coords.y - shapeStart.y;
        const x = width > 0 ? shapeStart.x : shapeStart.x + width;
        const y = height > 0 ? shapeStart.y : shapeStart.y + height;

        setCurrentShape({
          id: `shape-${Date.now()}`,
          type: shapeSettings.type,
          x,
          y,
          width: Math.abs(width),
          height: Math.abs(height),
          fill: shapeSettings.fill,
          fillColor: shapeSettings.fillColor,
          strokeColor: shapeSettings.strokeColor,
          strokeWidth: shapeSettings.strokeWidth,
        });
      }
    },
    [
      image,
      isPanning,
      lastPanPoint,
      pan,
      onPanChange,
      activeTool,
      cropStart,
      cropHandle,
      initialCropRect,
      isDrawing,
      shapeStart,
      shapeSettings,
      getCanvasCoords,
      getAspectRatioValue,
      onCropRectChange,
      draggingText,
      draggingShape,
      dragOffset,
      onUpdateText,
      onUpdateShape,
    ]
  );

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false);
    setCropStart(null);
    setCropHandle(null);
    setInitialCropRect(null);
    setDraggingText(null);
    setDraggingShape(null);

    if (activeTool === "draw" && isDrawing && currentPath.length > 1) {
      onAddDrawingPath({
        id: `path-${Date.now()}`,
        points: currentPath,
        color: drawingSettings.tool === "eraser" ? "#000" : drawingSettings.color,
        size: drawingSettings.size,
        tool: drawingSettings.tool,
      });
    }

    if (activeTool === "shapes" && currentShape) {
      if (currentShape.width > 5 && currentShape.height > 5) {
        onAddShape(currentShape);
      }
      setCurrentShape(null);
    }

    setIsDrawing(false);
    setCurrentPath([]);
    setShapeStart(null);
  }, [
    activeTool,
    isDrawing,
    currentPath,
    drawingSettings,
    onAddDrawingPath,
    currentShape,
    onAddShape,
  ]);

  // Get cursor style based on tool and position
  const getCursor = useCallback(() => {
    if (activeTool === "select") {
      return isPanning ? "grabbing" : "grab";
    }
    if (activeTool === "draw") {
      return "crosshair";
    }
    if (activeTool === "crop") {
      if (cropHandle) {
        const cursors: Record<string, string> = {
          nw: "nw-resize",
          ne: "ne-resize",
          sw: "sw-resize",
          se: "se-resize",
          n: "n-resize",
          s: "s-resize",
          w: "w-resize",
          e: "e-resize",
          move: "move",
        };
        return cursors[cropHandle] || "crosshair";
      }
      return "crosshair";
    }
    if (activeTool === "text") {
      return "text";
    }
    if (activeTool === "shapes") {
      return "crosshair";
    }
    return "default";
  }, [activeTool, isPanning, cropHandle]);

  if (!image) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-white/50">No image loaded</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-[#1a1a1a] touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onWheel={handleWheel}
      style={{ cursor: getCursor() }}
    >
      {/* Checkerboard background for transparency */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #2a2a2a 25%, transparent 25%),
            linear-gradient(-45deg, #2a2a2a 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #2a2a2a 75%),
            linear-gradient(-45deg, transparent 75%, #2a2a2a 75%)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
        }}
      />

      {/* Canvas container */}
      <div
        ref={canvasWrapperRef}
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {/* Main canvas */}
        <canvas
          ref={canvasRef}
          className="block shadow-2xl"
          style={{
            maxWidth: "none",
          }}
        />

        {/* Overlay canvas */}
        <canvas
          ref={overlayCanvasRef}
          className="pointer-events-none absolute left-0 top-0"
          style={{
            maxWidth: "none",
          }}
        />

        {/* Current drawing path preview */}
        {isDrawing && currentPath.length > 1 && (
          <svg
            className="pointer-events-none absolute left-0 top-0"
            width={image.width}
            height={image.height}
            style={{ maxWidth: "none" }}
          >
            <path
              d={`M ${currentPath[0].x} ${currentPath[0].y} ${currentPath
                .slice(1)
                .map((p, i) => {
                  if (i < currentPath.length - 2) {
                    const next = currentPath[i + 2];
                    const xc = (p.x + next.x) / 2;
                    const yc = (p.y + next.y) / 2;
                    return `Q ${p.x} ${p.y} ${xc} ${yc}`;
                  }
                  return `L ${p.x} ${p.y}`;
                })
                .join(" ")}`}
              fill="none"
              stroke={
                drawingSettings.tool === "eraser"
                  ? "rgba(255,255,255,0.5)"
                  : drawingSettings.color
              }
              strokeWidth={drawingSettings.size}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={
                drawingSettings.tool === "eraser" ? "5,5" : "none"
              }
            />
          </svg>
        )}
      </div>

      {/* Zoom indicator */}
      <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm">
        {Math.round(zoom * 100)}%
      </div>

      {/* Tool indicator */}
      <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-1.5 text-xs capitalize text-white/70 backdrop-blur-sm">
        {activeTool}
      </div>
    </div>
  );
}
