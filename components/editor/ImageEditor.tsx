"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  ExportSettings,
  AspectRatio,
  HistoryState,
  DEFAULT_ADJUSTMENTS,
} from "@/lib/types";
import { FILTER_PRESETS } from "@/lib/filters";
import { Canvas } from "./Canvas";
import { Toolbar } from "./Toolbar";
import { AdjustmentsPanel } from "./AdjustmentsPanel";
import { FiltersPanel } from "./FiltersPanel";
import { DrawingPanel } from "./DrawingPanel";
import { TextPanel } from "./TextPanel";
import { ShapesPanel } from "./ShapesPanel";
import { CropPanel } from "./CropPanel";
import { ExportPanel } from "./ExportPanel";
import { exportImage } from "@/lib/export";

export function ImageEditor() {
  // Image state
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>("select");

  // View state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Adjustments state
  const [adjustments, setAdjustments] = useState<Adjustments>(DEFAULT_ADJUSTMENTS);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Transform state
  const [transform, setTransform] = useState<Transform>({
    rotation: 0,
    flipX: false,
    flipY: false,
  });

  // Crop state
  const [cropRect, setCropRect] = useState<CropRect | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");

  // Drawing state
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);
  const [drawingSettings, setDrawingSettings] = useState<DrawingSettings>({
    tool: "brush",
    color: "#ffffff",
    size: 8,
  });

  // Text state
  const [texts, setTexts] = useState<TextOverlay[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [textSettings, setTextSettings] = useState<TextSettings>({
    text: "",
    fontSize: 48,
    fontFamily: "Inter",
    color: "#ffffff",
    bold: false,
    italic: false,
    align: "left",
  });

  // Shape state
  const [shapes, setShapes] = useState<ShapeOverlay[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [shapeSettings, setShapeSettings] = useState<ShapeSettings>({
    type: "rectangle",
    fill: false,
    fillColor: "#3b82f6",
    strokeColor: "#ffffff",
    strokeWidth: 3,
  });

  // Export state
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: "png",
    quality: 90,
    scale: 1,
  });
  const [isExporting, setIsExporting] = useState(false);

  // History state
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const state: HistoryState = {
      adjustments: { ...adjustments },
      transform: { ...transform },
      drawingPaths: [...drawingPaths],
      texts: [...texts],
      shapes: [...shapes],
      cropRect: cropRect ? { ...cropRect } : null,
    };

    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, state];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [adjustments, transform, drawingPaths, texts, shapes, cropRect, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setAdjustments(prevState.adjustments);
      setTransform(prevState.transform);
      setDrawingPaths(prevState.drawingPaths);
      setTexts(prevState.texts);
      setShapes(prevState.shapes);
      setCropRect(prevState.cropRect);
      setHistoryIndex((prev) => prev - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setAdjustments(nextState.adjustments);
      setTransform(nextState.transform);
      setDrawingPaths(nextState.drawingPaths);
      setTexts(nextState.texts);
      setShapes(nextState.shapes);
      setCropRect(nextState.cropRect);
      setHistoryIndex((prev) => prev + 1);
    }
  }, [history, historyIndex]);

  // Load image helper
  const loadImageToEditor = useCallback((img: HTMLImageElement) => {
    setImage(img);
    setOriginalImage(img);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setAdjustments(DEFAULT_ADJUSTMENTS);
    setTransform({ rotation: 0, flipX: false, flipY: false });
    setDrawingPaths([]);
    setTexts([]);
    setShapes([]);
    setCropRect(null);
    setActiveFilter(null);
    setHistory([]);
    setHistoryIndex(-1);

    // Save initial state
    setTimeout(() => {
      setHistory([
        {
          adjustments: DEFAULT_ADJUSTMENTS,
          transform: { rotation: 0, flipX: false, flipY: false },
          drawingPaths: [],
          texts: [],
          shapes: [],
          cropRect: null,
        },
      ]);
      setHistoryIndex(0);
    }, 0);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => loadImageToEditor(img);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [loadImageToEditor]);

  // Load sample image
  const handleLoadSampleImage = useCallback(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => loadImageToEditor(img);
    img.src = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80";
  }, [loadImageToEditor]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => loadImageToEditor(img);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [loadImageToEditor]);

  // Handle adjustments change
  const handleAdjustmentsChange = useCallback(
    (newAdjustments: Partial<Adjustments>) => {
      setAdjustments((prev) => ({ ...prev, ...newAdjustments }));
      setActiveFilter(null);
    },
    []
  );

  // Handle filter apply
  const handleApplyFilter = useCallback((filterId: string) => {
    const filter = FILTER_PRESETS.find((f) => f.id === filterId);
    if (filter) {
      setAdjustments({ ...DEFAULT_ADJUSTMENTS, ...filter.adjustments });
      setActiveFilter(filterId);
    }
  }, []);

  // Handle transform
  const handleRotate = useCallback((degrees: number) => {
    setTransform((prev) => ({
      ...prev,
      rotation: (prev.rotation + degrees) % 360,
    }));
    saveToHistory();
  }, [saveToHistory]);

  const handleFlipX = useCallback(() => {
    setTransform((prev) => ({ ...prev, flipX: !prev.flipX }));
    saveToHistory();
  }, [saveToHistory]);

  const handleFlipY = useCallback(() => {
    setTransform((prev) => ({ ...prev, flipY: !prev.flipY }));
    saveToHistory();
  }, [saveToHistory]);

  // Handle crop
  const handleApplyCrop = useCallback(() => {
    if (!image || !cropRect) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = cropRect.width;
    canvas.height = cropRect.height;

    ctx.drawImage(
      image,
      cropRect.x,
      cropRect.y,
      cropRect.width,
      cropRect.height,
      0,
      0,
      cropRect.width,
      cropRect.height
    );

    const newImg = new Image();
    newImg.onload = () => {
      setImage(newImg);
      setCropRect(null);
      setActiveTool("select");
      saveToHistory();
    };
    newImg.src = canvas.toDataURL();
  }, [image, cropRect, saveToHistory]);

  const handleCancelCrop = useCallback(() => {
    setCropRect(null);
  }, []);

  // Handle drawing
  const handleAddDrawingPath = useCallback(
    (path: DrawingPath) => {
      setDrawingPaths((prev) => [...prev, path]);
      saveToHistory();
    },
    [saveToHistory]
  );

  const handleClearDrawings = useCallback(() => {
    setDrawingPaths([]);
    saveToHistory();
  }, [saveToHistory]);

  // Handle text
  const handleAddText = useCallback(
    (text: TextOverlay) => {
      setTexts((prev) => [...prev, text]);
      saveToHistory();
    },
    [saveToHistory]
  );

  const handleUpdateText = useCallback(
    (id: string, updates: Partial<TextOverlay>) => {
      setTexts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    },
    []
  );

  const handleRemoveText = useCallback(
    (id: string) => {
      setTexts((prev) => prev.filter((t) => t.id !== id));
      if (selectedTextId === id) setSelectedTextId(null);
      saveToHistory();
    },
    [selectedTextId, saveToHistory]
  );

  const handleAddNewText = useCallback(() => {
    const newText: TextOverlay = {
      id: `text-${Date.now()}`,
      text: textSettings.text || "New Text",
      x: image ? image.width / 2 : 200,
      y: image ? image.height / 2 : 200,
      fontSize: textSettings.fontSize,
      fontFamily: textSettings.fontFamily,
      color: textSettings.color,
      bold: textSettings.bold,
      italic: textSettings.italic,
      align: textSettings.align,
    };
    setTexts((prev) => [...prev, newText]);
    setSelectedTextId(newText.id);
    saveToHistory();
  }, [image, textSettings, saveToHistory]);

  // Handle shapes
  const handleAddShape = useCallback(
    (shape: ShapeOverlay) => {
      setShapes((prev) => [...prev, shape]);
      saveToHistory();
    },
    [saveToHistory]
  );

  const handleRemoveShape = useCallback(
    (id: string) => {
      setShapes((prev) => prev.filter((s) => s.id !== id));
      if (selectedShapeId === id) setSelectedShapeId(null);
      saveToHistory();
    },
    [selectedShapeId, saveToHistory]
  );

  // Handle export
  const handleExport = useCallback(async () => {
    if (!image) return;

    setIsExporting(true);
    try {
      await exportImage({
        image,
        adjustments,
        transform,
        drawingPaths,
        texts,
        shapes,
        settings: exportSettings,
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  }, [image, adjustments, transform, drawingPaths, texts, shapes, exportSettings]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.25, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.25, 0.1));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case "v":
          setActiveTool("select");
          break;
        case "c":
          setActiveTool("crop");
          break;
        case "a":
          setActiveTool("adjustments");
          break;
        case "f":
          setActiveTool("filters");
          break;
        case "d":
          setActiveTool("draw");
          break;
        case "t":
          setActiveTool("text");
          break;
        case "s":
          setActiveTool("shapes");
          break;
        case "e":
          setActiveTool("export");
          break;
        case "=":
        case "+":
          handleZoomIn();
          break;
        case "-":
          handleZoomOut();
          break;
        case "0":
          handleZoomReset();
          break;
        case "delete":
        case "backspace":
          if (selectedTextId) {
            handleRemoveText(selectedTextId);
          } else if (selectedShapeId) {
            handleRemoveShape(selectedShapeId);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    selectedTextId,
    selectedShapeId,
    handleRemoveText,
    handleRemoveShape,
  ]);

  // Render panel based on active tool
  const renderPanel = () => {
    switch (activeTool) {
      case "adjustments":
        return (
          <AdjustmentsPanel
            adjustments={adjustments}
            onAdjustmentsChange={handleAdjustmentsChange}
            onRotate={handleRotate}
            onFlipX={handleFlipX}
            onFlipY={handleFlipY}
          />
        );
      case "filters":
        return (
          <FiltersPanel
            activeFilter={activeFilter}
            onApplyFilter={handleApplyFilter}
            previewImage={originalImage}
          />
        );
      case "draw":
        return (
          <DrawingPanel
            settings={drawingSettings}
            onSettingsChange={(s) =>
              setDrawingSettings((prev) => ({ ...prev, ...s }))
            }
            onClearDrawings={handleClearDrawings}
          />
        );
      case "text":
        return (
          <TextPanel
            settings={textSettings}
            onSettingsChange={(s) =>
              setTextSettings((prev) => ({ ...prev, ...s }))
            }
            texts={texts}
            selectedTextId={selectedTextId}
            onSelectText={setSelectedTextId}
            onUpdateText={handleUpdateText}
            onRemoveText={handleRemoveText}
            onAddText={handleAddNewText}
          />
        );
      case "shapes":
        return (
          <ShapesPanel
            settings={shapeSettings}
            onSettingsChange={(s) =>
              setShapeSettings((prev) => ({ ...prev, ...s }))
            }
            shapes={shapes}
            selectedShapeId={selectedShapeId}
            onSelectShape={setSelectedShapeId}
            onRemoveShape={handleRemoveShape}
          />
        );
      case "crop":
        return (
          <CropPanel
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            onApplyCrop={handleApplyCrop}
            onCancelCrop={handleCancelCrop}
            isCropActive={activeTool === "crop"}
            hasCropRect={!!cropRect}
          />
        );
      case "export":
        return (
          <ExportPanel
            settings={exportSettings}
            onSettingsChange={(s) =>
              setExportSettings((prev) => ({ ...prev, ...s }))
            }
            onExport={handleExport}
            isExporting={isExporting}
            imageWidth={image?.width ?? 0}
            imageHeight={image?.height ?? 0}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#0a0a0a]">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-white">Image Editor</h1>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/20"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Open Image
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div className="relative flex flex-1 flex-col">
          {image ? (
            <>
              {/* Toolbar */}
              <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
                <Toolbar
                  activeTool={activeTool}
                  onToolChange={setActiveTool}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={historyIndex > 0}
                  canRedo={historyIndex < history.length - 1}
                  zoom={zoom}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onZoomReset={handleZoomReset}
                />
              </div>

              {/* Canvas */}
              <Canvas
                image={image}
                adjustments={adjustments}
                transform={transform}
                activeTool={activeTool}
                zoom={zoom}
                pan={pan}
                onPanChange={setPan}
                cropRect={cropRect}
                onCropRectChange={setCropRect}
                aspectRatio={aspectRatio}
                drawingPaths={drawingPaths}
                onAddDrawingPath={handleAddDrawingPath}
                drawingSettings={drawingSettings}
                texts={texts}
                onAddText={handleAddText}
                onUpdateText={handleUpdateText}
                selectedTextId={selectedTextId}
                onSelectText={setSelectedTextId}
                textSettings={textSettings}
                shapes={shapes}
                onAddShape={handleAddShape}
                selectedShapeId={selectedShapeId}
                onSelectShape={setSelectedShapeId}
                shapeSettings={shapeSettings}
              />
            </>
          ) : (
            /* Upload prompt */
            <div
              className="flex flex-1 items-center justify-center p-8"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="flex max-w-md flex-col items-center rounded-2xl border-2 border-dashed border-white/20 bg-white/5 p-12 text-center transition-all hover:border-white/40 hover:bg-white/10">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                  <svg
                    className="h-10 w-10 text-white/60"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                    />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-semibold text-white">
                  Drop your image here
                </h2>
                <p className="mb-6 text-sm text-white/50">
                  or click the button below to browse
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white transition-all hover:from-violet-600 hover:to-fuchsia-600"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    Choose Image
                  </button>
                  <button
                    onClick={handleLoadSampleImage}
                    className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                      />
                    </svg>
                    Try Sample
                  </button>
                </div>
                <p className="mt-4 text-xs text-white/30">
                  Supports PNG, JPG, GIF, WebP, and more
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Side panel */}
        {image && renderPanel()}
      </div>
    </div>
  );
}
