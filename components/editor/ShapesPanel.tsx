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
}: ShapesPanelProps) {
  return (
    <div className="flex h-full w-72 flex-col border-l border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Shapes</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Shape selection */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
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
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Fill
            </h3>
            <button
              onClick={() => onSettingsChange({ fill: !settings.fill })}
              className={`
                rounded px-2 py-0.5 text-xs transition-all
                ${
                  settings.fill
                    ? "bg-white/20 text-white"
                    : "bg-white/5 text-white/50"
                }
              `}
            >
              {settings.fill ? "On" : "Off"}
            </button>
          </div>
          {settings.fill && (
            <>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => onSettingsChange({ fillColor: color })}
                    className={`
                      aspect-square rounded-lg transition-all
                      ${
                        settings.fillColor === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                          : "hover:scale-105"
                      }
                    `}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <label className="text-xs text-white/50">Custom:</label>
                <input
                  type="color"
                  value={settings.fillColor}
                  onChange={(e) =>
                    onSettingsChange({ fillColor: e.target.value })
                  }
                  className="h-8 w-full cursor-pointer rounded-lg border-0 bg-transparent"
                />
              </div>
            </>
          )}
        </div>

        {/* Stroke color */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Stroke
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => onSettingsChange({ strokeColor: color })}
                className={`
                  aspect-square rounded-lg transition-all
                  ${
                    settings.strokeColor === color
                      ? "ring-2 ring-white ring-offset-2 ring-offset-black"
                      : "hover:scale-105"
                  }
                `}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <label className="text-xs text-white/50">Custom:</label>
            <input
              type="color"
              value={settings.strokeColor}
              onChange={(e) =>
                onSettingsChange({ strokeColor: e.target.value })
              }
              className="h-8 w-full cursor-pointer rounded-lg border-0 bg-transparent"
            />
          </div>
        </div>

        {/* Stroke width */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Stroke Width
          </h3>
          <input
            type="range"
            min={1}
            max={20}
            value={settings.strokeWidth}
            onChange={(e) =>
              onSettingsChange({ strokeWidth: Number(e.target.value) })
            }
            className="w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
          />
          <div className="mt-1 flex justify-between text-xs text-white/40">
            <span>1px</span>
            <span>{settings.strokeWidth}px</span>
            <span>20px</span>
          </div>
        </div>

        {/* Shape layers */}
        {shapes.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
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
                        ? "bg-white/20"
                        : "bg-white/5 hover:bg-white/10"
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
                    <span className="text-xs capitalize text-white/70">
                      {shape.type}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveShape(shape.id);
                    }}
                    className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
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
        <div className="rounded-lg bg-white/5 p-3">
          <h4 className="mb-2 text-xs font-medium text-white/70">Tips</h4>
          <ul className="space-y-1 text-xs text-white/50">
            <li>• Click and drag to draw shapes</li>
            <li>• Hold Shift for perfect squares/circles</li>
            <li>• Select shape layer to delete</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
