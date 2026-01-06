"use client";

import React, { useCallback, useState } from "react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export function UploadZone({ onFileSelect, isLoading }: UploadZoneProps) {
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
    <div className="flex h-full w-full items-center justify-center p-8">
      <label
        className={`
          group relative flex h-[400px] w-full max-w-2xl cursor-pointer flex-col items-center justify-center
          rounded-2xl border-2 border-dashed transition-all duration-300
          ${
            isDragging
              ? "border-white/60 bg-white/10 scale-[1.02]"
              : "border-white/20 bg-white/[0.02] hover:border-white/40 hover:bg-white/[0.04]"
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
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
            <p className="text-sm text-white/60">Loading image...</p>
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <div
              className={`
                mb-6 flex h-20 w-20 items-center justify-center rounded-2xl
                bg-gradient-to-br from-white/10 to-white/5 transition-transform duration-300
                ${isDragging ? "scale-110" : "group-hover:scale-105"}
              `}
            >
              <svg
                className="h-10 w-10 text-white/70"
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

            <h3 className="mb-2 text-xl font-medium text-white/90">
              Drop your image here
            </h3>
            <p className="mb-6 text-sm text-white/50">
              or click to browse from your computer
            </p>

            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="rounded-md bg-white/10 px-2 py-1">PNG</span>
              <span className="rounded-md bg-white/10 px-2 py-1">JPG</span>
              <span className="rounded-md bg-white/10 px-2 py-1">WebP</span>
              <span className="rounded-md bg-white/10 px-2 py-1">GIF</span>
            </div>
          </>
        )}

        {/* Gradient border effect */}
        <div
          className={`
            pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300
            ${isDragging ? "opacity-100" : "group-hover:opacity-50"}
          `}
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
          }}
        />
      </label>
    </div>
  );
}
