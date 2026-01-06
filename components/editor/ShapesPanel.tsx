"use client";

import React from "react";
import { ShapeSettings, ShapeOverlay, ShapeType } from "@/lib/types";

interface ShapesPanelProps {
  settings: ShapeSettings;
  onSettingsChange: (settings: Partial<ShapeSettings>) => void;
  shapes: ShapeOverlay[];
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
  onRemoveShape: (id: string) => void;
  onUpdateShape: (id: string, updates: Partial<ShapeOverlay>) => void;
}

const COLORS = [
  "#ffffff",
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const SHAPES: { type: ShapeType; icon: React.ReactNode; label: string }[] = [
  {
    type: "rectangle",
    label: "Rectangle",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="4" y="6" width="16" height="12" rx="1" />
      </svg>
    ),
  },
  {
    type: "circle",
    label: "Circle",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
  {
    type: "triangle",
    label: "Triangle",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 4L4 20h16L12 4z" />
      </svg>
    ),
  },
  {
    type: "line",
    label: "Line",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <line x1="4" y1="20" x2="20" y2="4" />
      </svg>
    ),
  },
  {
    type: "arrow",
    label: "Arrow",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20l16-16m0 0h-12m12 0v12" />
      </svg>
    ),
  },
  {
    type: "star",
    label: "Star",
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
];

export function ShapesPanel({
  settings,
  onSettingsChange,
  shapes,
  selectedShapeId,
  onSelectShape,
  onRemoveShape,
  onUpdateShape,
}: ShapesPanelProps) {
  // Get the selected shape for displaying its current values
  const selectedShape = selectedShapeId
    ? shapes.find((s) => s.id === selectedShapeId)
    : null;

  // Helper to handle settings change - updates selected shape if one is selected
  const handleSettingsChange = (newSettings: Partial<ShapeSettings>) => {
    // Always update the settings for new shapes
    onSettingsChange(newSettings);

    // If a shape is selected, also update that shape
    if (selectedShapeId && selectedShape) {
      const shapeUpdates: Partial<ShapeOverlay> = {};
      if (newSettings.fill !== undefined) shapeUpdates.fill = newSettings.fill;
      if (newSettings.fillColor !== undefined) shapeUpdates.fillColor = newSettings.fillColor;
      if (newSettings.strokeColor !== undefined) shapeUpdates.strokeColor = newSettings.strokeColor;
      if (newSettings.strokeWidth !== undefined) shapeUpdates.strokeWidth = newSettings.strokeWidth;
      
      if (Object.keys(shapeUpdates).length > 0) {
        onUpdateShape(selectedShapeId, shapeUpdates);
      }
    }
  };

  // Get display values - use selected shape values if selected, otherwise use settings
  const displayFill = selectedShape ? selectedShape.fill : settings.fill;
  const displayFillColor = selectedShape ? selectedShape.fillColor : settings.fillColor;
  const displayStrokeColor = selectedShape ? selectedShape.strokeColor : settings.strokeColor;
  const displayStrokeWidth = selectedShape ? selectedShape.strokeWidth : settings.strokeWidth;
  return (
    <div className="flex h-full w-full md:w-72 flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-white max-h-[50vh] md:max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 md:py-3">
        <h2 className="text-sm font-semibold text-gray-900">Shapes</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {/* Shape selection */}
        <div className="mb-4 md:mb-6">
          <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Shape
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {SHAPES.map((shape) => (
              <button
                key={shape.type}
                onClick={() => onSettingsChange({ type: shape.type })}
                className={`
                  flex flex-col items-center justify-center gap-1 rounded-lg p-3 transition-all
                  ${
                    settings.type === shape.type
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }
                `}
              >
                {shape.icon}
                <span className="text-[10px]">{shape.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fill color */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Fill {selectedShape && <span className="text-blue-500">(editing)</span>}
            </h3>
            <button
              onClick={() => handleSettingsChange({ fill: !displayFill })}
              className={`
                rounded px-2 py-0.5 text-xs transition-all
                ${
                  displayFill
                    ? "bg-gray-200 text-gray-900"
                    : "bg-gray-100 text-gray-500"
                }
              `}
            >
              {displayFill ? "On" : "Off"}
            </button>
          </div>
          {displayFill && (
            <>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleSettingsChange({ fillColor: color })}
                    className={`
                      aspect-square rounded-lg border transition-all
                      ${
                        displayFillColor === color
                          ? "ring-2 ring-gray-900 ring-offset-2"
                          : "border-gray-200 hover:scale-105"
                      }
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-gray-500">Custom:</label>
                <input
                  type="color"
                  value={displayFillColor}
                  onChange={(e) =>
                    handleSettingsChange({ fillColor: e.target.value })
                  }
                  className="h-8 w-full cursor-pointer rounded-lg border border-gray-200 bg-transparent"
                />
              </div>
            </>
          )}
        </div>

        {/* Stroke color */}
        <div className="mb-4 md:mb-6">
          <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Stroke {selectedShape && <span className="text-blue-500">(editing)</span>}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleSettingsChange({ strokeColor: color })}
                className={`
                  aspect-square rounded-lg border transition-all
                  ${
                    displayStrokeColor === color
                      ? "ring-2 ring-gray-900 ring-offset-2"
                      : "border-gray-200 hover:scale-105"
                  }
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-2 md:mt-3 flex items-center gap-2">
            <label className="text-xs text-gray-500">Custom:</label>
            <input
              type="color"
              value={displayStrokeColor}
              onChange={(e) =>
                handleSettingsChange({ strokeColor: e.target.value })
              }
              className="h-8 w-full cursor-pointer rounded-lg border border-gray-200 bg-transparent"
            />
          </div>
        </div>

        {/* Stroke width */}
        <div className="mb-4 md:mb-6">
          <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Stroke Width {selectedShape && <span className="text-blue-500">(editing)</span>}
          </h3>
          <input
            type="range"
            min={1}
            max={20}
            value={displayStrokeWidth}
            onChange={(e) =>
              handleSettingsChange({ strokeWidth: Number(e.target.value) })
            }
            className="w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gray-200 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900"
          />
          <div className="mt-1 flex justify-between text-xs text-gray-400">
            <span>1px</span>
            <span>{displayStrokeWidth}px</span>
            <span>20px</span>
          </div>
        </div>

        {/* Shape layers */}
        {shapes.length > 0 && (
          <div className="mb-4 md:mb-6">
            <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Shape Layers
            </h3>
            <div className="space-y-2">
              {shapes.map((shape) => (
                <div
                  key={shape.id}
                  onClick={() => onSelectShape(shape.id)}
                  className={`
                    flex cursor-pointer items-center justify-between rounded-lg p-2 transition-all
                    ${
                      selectedShapeId === shape.id
                        ? "bg-gray-200"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded"
                      style={{
                        backgroundColor: shape.fill
                          ? shape.fillColor
                          : "transparent",
                        border: `2px solid ${shape.strokeColor}`,
                      }}
                    />
                    <span className="text-xs capitalize text-gray-600">
                      {shape.type}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveShape(shape.id);
                    }}
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-300 hover:text-gray-700"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="rounded-lg bg-gray-50 p-3 hidden md:block">
          <h4 className="mb-2 text-xs font-medium text-gray-700">Tips</h4>
          <ul className="space-y-1 text-xs text-gray-500">
            <li>• Click and drag to draw shapes</li>
            <li>• Hold Shift for perfect squares/circles</li>
            <li>• Select shape layer to delete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
