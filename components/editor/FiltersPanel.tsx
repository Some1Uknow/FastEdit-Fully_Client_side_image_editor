"use client";

import React, { useMemo } from "react";
import { FILTER_PRESETS, getFilterString } from "@/lib/filters";
import { DEFAULT_ADJUSTMENTS } from "@/lib/types";

interface FiltersPanelProps {
  activeFilter: string | null;
  onApplyFilter: (filterId: string) => void;
  previewImage: HTMLImageElement | null;
}

export function FiltersPanel({
  activeFilter,
  onApplyFilter,
  previewImage,
}: FiltersPanelProps) {
  // Generate preview thumbnails
  const filterPreviews = useMemo(() => {
    if (!previewImage) return {};

    const previews: Record<string, string> = {};
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return previews;

    const size = 80;
    canvas.width = size;
    canvas.height = size;

    // Calculate crop to make square thumbnail
    const imgAspect = previewImage.width / previewImage.height;
    let sx = 0,
      sy = 0,
      sw = previewImage.width,
      sh = previewImage.height;

    if (imgAspect > 1) {
      sw = previewImage.height;
      sx = (previewImage.width - sw) / 2;
    } else {
      sh = previewImage.width;
      sy = (previewImage.height - sh) / 2;
    }

    FILTER_PRESETS.forEach((filter) => {
      ctx.clearRect(0, 0, size, size);

      // Apply filter adjustments
      const adjustments = { ...DEFAULT_ADJUSTMENTS, ...filter.adjustments };
      ctx.filter = getFilterString(adjustments);

      ctx.drawImage(previewImage, sx, sy, sw, sh, 0, 0, size, size);
      previews[filter.id] = canvas.toDataURL("image/jpeg", 0.7);
    });

    return previews;
  }, [previewImage]);

  return (
    <div className="flex h-full w-full md:w-72 flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-white max-h-[50vh] md:max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 md:py-3">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
        {activeFilter && activeFilter !== "none" && (
          <button
            onClick={() => onApplyFilter("none")}
            className="text-xs text-gray-500 transition-colors hover:text-gray-900"
          >
            Remove
          </button>
        )}
      </div>

      {/* Filter grid */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3">
          {FILTER_PRESETS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onApplyFilter(filter.id)}
              className={`
                group relative overflow-hidden rounded-xl transition-all duration-200
                ${
                  activeFilter === filter.id ||
                  (filter.id === "none" && !activeFilter)
                    ? "ring-2 ring-gray-900 ring-offset-2"
                    : "hover:ring-1 hover:ring-gray-300"
                }
              `}
            >
              {/* Preview image */}
              <div className="aspect-square w-full overflow-hidden bg-gray-100">
                {filterPreviews[filter.id] ? (
                  <img
                    src={filterPreviews[filter.id]}
                    alt={filter.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-2">
                <span className="text-xs font-medium text-white">
                  {filter.name}
                </span>
              </div>

              {/* Active indicator */}
              {(activeFilter === filter.id ||
                (filter.id === "none" && !activeFilter)) && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900">
                  <svg
                    className="h-3 w-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
