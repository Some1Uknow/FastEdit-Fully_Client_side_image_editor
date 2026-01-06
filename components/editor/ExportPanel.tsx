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
    <div className="flex h-full w-full md:w-72 flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-white max-h-[50vh] md:max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 md:py-3">
        <h2 className="text-sm font-semibold text-gray-900">Export</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {/* Format selection */}
        <div className="mb-4 md:mb-6">
          <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Format
          </h3>
          <div className="flex md:flex-col gap-2 md:space-y-2">
            {FORMATS.map((format) => (
              <button
                key={format.value}
                onClick={() => onSettingsChange({ format: format.value })}
                className={`
                  flex flex-1 md:w-full items-center md:items-start gap-2 md:gap-3 rounded-lg p-2 md:p-3 text-left transition-all
                  ${
                    settings.format === format.value
                      ? "bg-gray-100 ring-1 ring-gray-300"
                      : "bg-gray-50 hover:bg-gray-100"
                  }
                `}
              >
                <div
                  className={`
                    mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-all
                    ${
                      settings.format === format.value
                        ? "border-gray-900 bg-gray-900"
                        : "border-gray-300"
                    }
                  `}
                >
                  {settings.format === format.value && (
                    <div className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <span className="text-xs md:text-sm font-medium text-gray-900">
                    {format.label}
                  </span>
                  <p className="hidden md:block mt-0.5 text-xs text-gray-500">
                    {format.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality slider (for JPEG and WebP) */}
        {(settings.format === "jpeg" || settings.format === "webp") && (
          <div className="mb-4 md:mb-6">
            <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                className="w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gray-200 [&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900"
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>Low</span>
                <span className="font-medium text-gray-600">
                  {settings.quality}%
                </span>
                <span>High</span>
              </div>
            </div>
          </div>
        )}

        {/* Scale selection */}
        <div className="mb-4 md:mb-6">
          <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Scale
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {SCALES.map((scale) => (
              <button
                key={scale.value}
                onClick={() => onSettingsChange({ scale: scale.value })}
                className={`
                  rounded-lg py-1.5 md:py-2 text-xs md:text-sm font-medium transition-all
                  ${
                    settings.scale === scale.value
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }
                `}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output dimensions */}
        <div className="mb-4 md:mb-6 rounded-lg bg-gray-50 p-3 md:p-4">
          <h4 className="mb-2 md:mb-3 text-xs font-medium text-gray-600">
            Output Dimensions
          </h4>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <p className="text-base md:text-lg font-semibold text-gray-900">{outputWidth}</p>
              <p className="text-xs text-gray-500">Width</p>
            </div>
            <svg
              className="h-4 w-4 text-gray-300"
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
              <p className="text-base md:text-lg font-semibold text-gray-900">{outputHeight}</p>
              <p className="text-xs text-gray-500">Height</p>
            </div>
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={onExport}
          disabled={isExporting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 py-2.5 md:py-3 text-xs md:text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
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
      <div className="border-t border-gray-200 px-4 py-2 md:py-3 hidden md:block">
        <p className="text-xs text-gray-400">
          Image will be downloaded to your device
        </p>
      </div>
    </div>
  );
}
