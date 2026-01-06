"use client";

import React from "react";
import { AspectRatio } from "@/lib/types";

interface CropPanelProps {
  aspectRatio: AspectRatio;
  onAspectRatioChange: (ratio: AspectRatio) => void;
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  isCropActive: boolean;
  hasCropRect: boolean;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string; icon: React.ReactNode }[] = [
  {
    value: "free",
    label: "Free",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="4" y="4" width="16" height="16" rx="1" strokeDasharray="4 2" />
      </svg>
    ),
  },
  {
    value: "1:1",
    label: "1:1",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="5" y="5" width="14" height="14" rx="1" />
      </svg>
    ),
  },
  {
    value: "4:3",
    label: "4:3",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="6" width="18" height="12" rx="1" />
      </svg>
    ),
  },
  {
    value: "16:9",
    label: "16:9",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="7" width="20" height="10" rx="1" />
      </svg>
    ),
  },
  {
    value: "3:2",
    label: "3:2",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="6" width="18" height="12" rx="1" />
      </svg>
    ),
  },
  {
    value: "2:3",
    label: "2:3",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="6" y="3" width="12" height="18" rx="1" />
      </svg>
    ),
  },
  {
    value: "9:16",
    label: "9:16",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="7" y="2" width="10" height="20" rx="1" />
      </svg>
    ),
  },
];

export function CropPanel({
  aspectRatio,
  onAspectRatioChange,
  onApplyCrop,
  onCancelCrop,
  isCropActive,
  hasCropRect,
}: CropPanelProps) {
  return (
    <div className="flex h-full w-72 flex-col border-l border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Crop</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Aspect ratio */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Aspect Ratio
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                onClick={() => onAspectRatioChange(ratio.value)}
                className={`
                  flex items-center gap-2 rounded-lg px-3 py-2.5 transition-all
                  ${
                    aspectRatio === ratio.value
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                {ratio.icon}
                <span className="text-sm font-medium">{ratio.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 rounded-lg bg-white/5 p-4">
          <h4 className="mb-2 text-xs font-medium text-white/70">
            How to Crop
          </h4>
          <ol className="space-y-2 text-xs text-white/50">
            <li className="flex gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px]">
                1
              </span>
              <span>Click and drag on the image to select crop area</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px]">
                2
              </span>
              <span>Drag corners or edges to adjust</span>
            </li>
            <li className="flex gap-2">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px]">
                3
              </span>
              <span>Click Apply to confirm or Cancel to discard</span>
            </li>
          </ol>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={onApplyCrop}
            disabled={!hasCropRect}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            Apply Crop
          </button>
          <button
            onClick={onCancelCrop}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 py-2.5 text-sm font-medium text-white/70 transition-all hover:bg-white/20 hover:text-white"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Cancel
          </button>
        </div>
      </div>

      {/* Status bar */}
      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isCropActive && hasCropRect ? "bg-green-500" : "bg-white/30"
            }`}
          />
          <span className="text-xs text-white/50">
            {isCropActive && hasCropRect
              ? "Crop area selected"
              : "Draw crop area on image"}
          </span>
        </div>
      </div>
    </div>
  );
}
