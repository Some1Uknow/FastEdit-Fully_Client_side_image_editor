"use client";

import React, { useCallback, useState } from "react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  onUseSample: () => void;
  isLoading: boolean;
}

export function UploadZone({ onFileSelect, onUseSample, isLoading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#fafafa] p-4">
      {/* Main Card */}
      <label
        className={`
          group relative z-10 flex w-full max-w-[420px] cursor-pointer flex-col items-center justify-center
          overflow-hidden rounded-2xl border bg-white p-6 sm:p-12
          shadow-sm transition-all duration-300 ease-out
          ${
            isDragging
              ? "scale-[1.02] border-gray-400 shadow-md"
              : "border-gray-200 hover:border-gray-300 hover:shadow-md"
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={isLoading}
        />

        {isLoading ? (
          <div className="flex flex-col items-center gap-4 sm:gap-6 py-4 sm:py-8">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <div className="absolute inset-0 animate-ping rounded-full bg-gray-200" />
              <div className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-base sm:text-lg font-medium text-gray-900">Processing...</p>
              <p className="text-xs sm:text-sm text-gray-500">Preparing your canvas</p>
            </div>
          </div>
        ) : (
          <>
            {/* Icon Container */}
            <div className="relative mb-4 sm:mb-8">
              <div
                className={`
                  relative flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-xl sm:rounded-2xl
                  bg-gray-50 border border-gray-200
                  transition-all duration-300
                  ${isDragging ? "scale-110 bg-gray-100" : "group-hover:scale-105 group-hover:bg-gray-100"}
                `}
              >
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">
                Upload Image
              </h3>
              <p className="max-w-[240px] text-xs sm:text-sm leading-relaxed text-gray-500">
                <span className="hidden sm:inline">Drag and drop your image here, or click to browse files</span>
                <span className="sm:hidden">Tap to select an image from your device</span>
              </p>
            </div>

            {/* Divider */}
            <div className="my-4 sm:my-8 flex w-full items-center gap-4 px-4 sm:px-8">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                Supports
              </span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* File Types */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
              {["PNG", "JPG", "WEBP"].map((type) => (
                <span
                  key={type}
                  className="rounded-md sm:rounded-lg border border-gray-200 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] font-medium text-gray-500 transition-colors group-hover:border-gray-300 group-hover:text-gray-600"
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Use Sample Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUseSample();
              }}
              className="group/btn relative flex items-center gap-2 rounded-full bg-gray-900 px-4 sm:px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium text-white transition-all hover:bg-gray-800"
            >
              <span className="relative z-10">Try Sample Image</span>
              <svg
                className="relative z-10 h-2.5 w-2.5 sm:h-3 sm:w-3 transition-transform group-hover/btn:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </>
        )}
      </label>

      {/* Footer Info - hide on mobile */}
      <div className="absolute bottom-4 sm:bottom-8 text-[10px] sm:text-xs text-gray-400 hidden sm:block">
        Press <kbd className="font-sans font-semibold text-gray-600">⌘ V</kbd> to paste image
      </div>
    </div>
  );
}
