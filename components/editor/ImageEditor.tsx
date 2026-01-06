"use client";

import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
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
import { UploadZone } from "./UploadZone";

export function ImageEditor() {
  // Image state
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Tool state
  const [activeTool, setActiveTool] = useState<Tool>("select");

  // View state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

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

  // Calculate optimal zoom to fit image in viewport
  const calculateFitZoom = useCallback((imgWidth: number, imgHeight: number) => {
    // Get container dimensions - use window as fallback
    const containerWidth = canvasContainerRef.current?.clientWidth || window.innerWidth - 300; // 300 for side panel
    const containerHeight = canvasContainerRef.current?.clientHeight || window.innerHeight - 100; // 100 for toolbar
    
    // Add padding (85% of available space)
    const availableWidth = containerWidth * 0.85;
    const availableHeight = containerHeight * 0.85;
    
    // Calculate zoom to fit
    const zoomX = availableWidth / imgWidth;
    const zoomY = availableHeight / imgHeight;
    
    // Use the smaller zoom to ensure image fits both dimensions
    const fitZoom = Math.min(zoomX, zoomY);
    
    // Clamp between 0.1 and 1 (don't zoom in beyond 100% on load)
    return Math.min(Math.max(fitZoom, 0.1), 1);
  }, []);

  // Load image helper
  const loadImageToEditor = useCallback((img: HTMLImageElement) => {
    setIsLoading(true);
    // Simulate a small delay for the loading animation to be visible
    setTimeout(() => {
      // Calculate optimal zoom before setting image
      const optimalZoom = calculateFitZoom(img.width, img.height);
      
      setImage(img);
      setOriginalImage(img);
      setZoom(optimalZoom);
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
        setIsLoading(false);
      }, 0);
    }, 800);
  }, [calculateFitZoom]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => loadImageToEditor(img);
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [loadImageToEditor]);

  // Handle file select from UploadZone
  const handleFileSelect = useCallback((file: File) => {
    setIsLoading(true);
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
    setIsLoading(true);
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

  const handleUpdateShape = useCallback(
    (id: string, updates: Partial<ShapeOverlay>) => {
      setShapes((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      saveToHistory();
    },
    [saveToHistory]
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
            onUpdateShape={handleUpdateShape}
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
    <div className="flex h-screen w-full flex-col bg-[#fafafa]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Floating Navbar - only show when no image is loaded */}
      {!image && (
        <nav className="fixed left-1/2 top-4 z-50 flex -translate-x-1/2 items-center gap-6 rounded-full border border-gray-200 bg-white/80 px-6 py-3 backdrop-blur-xl shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              FastEdit
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-medium text-gray-700 transition-all hover:bg-gray-200"
            >
              <svg
                className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-gray-700"
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
        </nav>
      )}

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas area */}
        <div ref={canvasContainerRef} className="relative flex flex-1 flex-col">
          {image ? (
            <>
              {/* Toolbar - positioned at top with proper spacing */}
              <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
                <Toolbar
                  fileInputRef={fileInputRef}
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
            <UploadZone
              onFileSelect={handleFileSelect}
              onUseSample={handleLoadSampleImage}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Side panel */}
        {image && renderPanel()}
      </div>
    </div>
  );
}
