"use client";

import React from "react";
import { DrawingSettings } from "@/lib/types";

interface DrawingPanelProps {
  settings: DrawingSettings;
  onSettingsChange: (settings: Partial<DrawingSettings>) => void;
  onClearDrawings: () => void;
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

const BRUSH_SIZES = [4, 8, 12, 20, 32];

export function DrawingPanel({
  settings,
  onSettingsChange,
  onClearDrawings,
}: DrawingPanelProps) {
  return (
    <div className="flex h-full w-full md:w-72 flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-white max-h-[50vh] md:max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 md:py-3">
        <h2 className="text-sm font-semibold text-gray-900">Draw</h2>
        <button
          onClick={onClearDrawings}
          className="text-xs text-gray-500 transition-colors hover:text-gray-900"
        >
          Clear All
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {/* Tool selection */}
        <div className="mb-4 md:mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Tool
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => onSettingsChange({ tool: "brush" })}
              className={`
                flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all
                ${
                  settings.tool === "brush"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                }
              `}
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
                  d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
                />
              </svg>
              Brush
            </button>
            <button
              onClick={() => onSettingsChange({ tool: "eraser" })}
              className={`
                flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all
                ${
                  settings.tool === "eraser"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                }
              `}
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
                  d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z"
                />
              </svg>
              Eraser
            </button>
          </div>
        </div>

        {/* Brush size */}
        <div className="mb-4 md:mb-6">
          <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Size
          </h3>
          <div className="flex items-center justify-between gap-2">
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => onSettingsChange({ size })}
                className={`
                  flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg transition-all
                  ${
                    settings.size === size
                      ? "bg-gray-200 ring-2 ring-gray-400"
                      : "bg-gray-100 hover:bg-gray-200"
                  }
                `}
              >
                <div
                  className="rounded-full bg-gray-900"
                  style={{
                    width: Math.min(size, 24),
                    height: Math.min(size, 24),
                  }}
                />
              </button>
            ))}
          </div>
          <div className="mt-2 md:mt-3">
            <input
              type="range"
              min={1}
              max={50}
              value={settings.size}
              onChange={(e) =>
                onSettingsChange({ size: Number(e.target.value) })
              }
              className="w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gray-200 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400">
              <span>1px</span>
              <span>{settings.size}px</span>
              <span>50px</span>
            </div>
          </div>
        </div>

        {/* Color picker */}
        {settings.tool === "brush" && (
          <div className="mb-4 md:mb-6">
            <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Color
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onSettingsChange({ color })}
                  className={`
                    aspect-square rounded-lg border transition-all
                    ${
                      settings.color === color
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
                value={settings.color}
                onChange={(e) => onSettingsChange({ color: e.target.value })}
                className="h-8 w-full cursor-pointer rounded-lg border border-gray-200 bg-transparent"
              />
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="mb-4 md:mb-6 hidden md:block">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Preview
          </h3>
          <div className="flex h-20 items-center justify-center rounded-lg bg-gray-100">
            <div
              className="rounded-full"
              style={{
                width: settings.size,
                height: settings.size,
                backgroundColor:
                  settings.tool === "eraser" ? "#9ca3af" : settings.color,
                border:
                  settings.tool === "eraser" ? "2px dashed #6b7280" : "none",
              }}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="rounded-lg bg-gray-50 p-3 hidden md:block">
          <h4 className="mb-2 text-xs font-medium text-gray-700">Tips</h4>
          <ul className="space-y-1 text-xs text-gray-500">
            <li>• Click and drag to draw</li>
            <li>• Use eraser to remove strokes</li>
            <li>• Adjust size for different effects</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
