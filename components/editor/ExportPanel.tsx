"use client";

import React from "react";
import { ExportSettings, ExportFormat } from "@/lib/types";

interface ExportPanelProps {
  settings: ExportSettings;
  onSettingsChange: (settings: Partial<ExportSettings>) => void;
  onExport: () => void;
  isExporting: boolean;
  imageWidth: number;
  imageHeight: number;
}

const FORMATS: { value: ExportFormat; label: string; description: string }[] = [
  { value: "png", label: "PNG", description: "Lossless, supports transparency" },
  { value: "jpeg", label: "JPEG", description: "Smaller file size, no transparency" },
  { value: "webp", label: "WebP", description: "Modern format, best compression" },
];

const SCALES = [
  { value: 0.5, label: "0.5x" },
  { value: 1, label: "1x" },
  { value: 2, label: "2x" },
  { value: 3, label: "3x" },
];

export function ExportPanel({
  settings,
  onSettingsChange,
  onExport,
  isExporting,
  imageWidth,
  imageHeight,
}: ExportPanelProps) {
  const outputWidth = Math.round(imageWidth * settings.scale);
  const outputHeight = Math.round(imageHeight * settings.scale);

  return (
    <div className="flex h-full w-72 flex-col border-l border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Export</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Format selection */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Format
          </h3>
          <div className="space-y-2">
            {FORMATS.map((format) => (
              <button
                key={format.value}
                onClick={() => onSettingsChange({ format: format.value })}
                className={`
                  flex w-full items-start gap-3 rounded-lg p-3 text-left transition-all
                  ${
                    settings.format === format.value
                      ? "bg-white/20 ring-1 ring-white/30"
                      : "bg-white/5 hover:bg-white/10"
                  }
                `}
              >
                <div
                  className={`
                    mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all
                    ${
                      settings.format === format.value
                        ? "border-white bg-white"
                        : "border-white/30"
                    }
                  `}
                >
                  {settings.format === format.value && (
                    <div className="h-1.5 w-1.5 rounded-full bg-black" />
                  )}
                </div>
                <div>
                  <span className="text-sm font-medium text-white">
                    {format.label}
                  </span>
                  <p className="mt-0.5 text-xs text-white/50">
                    {format.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality slider (for JPEG and WebP) */}
        {(settings.format === "jpeg" || settings.format === "webp") && (
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              Quality
            </h3>
            <div className="relative">
              <input
                type="range"
                min={10}
                max={100}
                value={settings.quality}
                onChange={(e) =>
                  onSettingsChange({ quality: Number(e.target.value) })
                }
                className="w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-white/10 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
              <div className="mt-2 flex justify-between text-xs text-white/40">
                <span>Low</span>
                <span className="font-medium text-white/70">
                  {settings.quality}%
                </span>
                <span>High</span>
              </div>
            </div>
          </div>
        )}

        {/* Scale selection */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Scale
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {SCALES.map((scale) => (
              <button
                key={scale.value}
                onClick={() => onSettingsChange({ scale: scale.value })}
                className={`
                  rounded-lg py-2 text-sm font-medium transition-all
                  ${
                    settings.scale === scale.value
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output dimensions */}
        <div className="mb-6 rounded-lg bg-white/5 p-4">
          <h4 className="mb-3 text-xs font-medium text-white/70">
            Output Dimensions
          </h4>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{outputWidth}</p>
              <p className="text-xs text-white/50">Width</p>
            </div>
            <svg
              className="h-4 w-4 text-white/30"
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
            <div className="text-center">
              <p className="text-lg font-semibold text-white">{outputHeight}</p>
              <p className="text-xs text-white/50">Height</p>
            </div>
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 py-3 text-sm font-semibold text-white transition-all hover:from-violet-600 hover:to-fuchsia-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Exporting...
            </>
          ) : (
            <>
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
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download Image
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="border-t border-white/10 px-4 py-3">
        <p className="text-xs text-white/40">
          Image will be downloaded to your device
        </p>
      </div>
    </div>
  );
}
