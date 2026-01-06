import {
  Adjustments,
  Transform,
  DrawingPath,
  TextOverlay,
  ShapeOverlay,
  ExportSettings,
} from "./types";
import { getFilterString } from "./filters";

interface ExportOptions {
  image: HTMLImageElement;
  adjustments: Adjustments;
  transform: Transform;
  drawingPaths: DrawingPath[];
  texts: TextOverlay[];
  shapes: ShapeOverlay[];
  settings: ExportSettings;
}

export async function exportImage(options: ExportOptions): Promise<void> {
  const {
    image,
    adjustments,
    transform,
    drawingPaths,
    texts,
    shapes,
    settings,
  } = options;

  // Create canvas with scaled dimensions
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  const width = Math.round(image.width * settings.scale);
  const height = Math.round(image.height * settings.scale);

  canvas.width = width;
  canvas.height = height;

  // Scale context
  ctx.scale(settings.scale, settings.scale);

  // Apply transform
  ctx.save();
  ctx.translate(image.width / 2, image.height / 2);
  ctx.rotate((transform.rotation * Math.PI) / 180);
  ctx.scale(transform.flipX ? -1 : 1, transform.flipY ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Apply filters
  ctx.filter = getFilterString(adjustments);

  // Draw image
  ctx.drawImage(image, 0, 0);

  // Restore context
  ctx.restore();

  // Reset filter for overlays
  ctx.filter = "none";

  // Draw paths
  drawingPaths.forEach((path) => {
    if (path.points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);

    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
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

  // Get data URL
  let mimeType: string;
  switch (settings.format) {
    case "jpeg":
      mimeType = "image/jpeg";
      break;
    case "webp":
      mimeType = "image/webp";
      break;
    default:
      mimeType = "image/png";
  }

  const quality = settings.format === "png" ? 1 : settings.quality / 100;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  // Download
  const link = document.createElement("a");
  link.download = `edited-image.${settings.format}`;
  link.href = dataUrl;
  link.click();
}

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
