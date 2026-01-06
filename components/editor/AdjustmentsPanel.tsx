"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Adjustments, DEFAULT_ADJUSTMENTS } from "@/lib/types";

interface AdjustmentsPanelProps {
  adjustments: Adjustments;
  onAdjustmentsChange: (adjustments: Partial<Adjustments>) => void;
  onRotate: (degrees: number) => void;
  onFlipX: () => void;
  onFlipY: () => void;
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function Slider({ label, value, min, max, onChange }: SliderProps) {
  // Local state for immediate visual feedback
  const [localValue, setLocalValue] = useState(value);
  const rafRef = useRef<number | null>(null);
  const lastCommittedValue = useRef(value);
  
  // Sync local value when prop changes (e.g., reset)
  useEffect(() => {
    setLocalValue(value);
    lastCommittedValue.current = value;
  }, [value]);
  
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    
    // Update local state immediately for smooth visual feedback
    setLocalValue(newValue);
    
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Use requestAnimationFrame to batch updates and sync with display refresh
    rafRef.current = requestAnimationFrame(() => {
      // Only commit if value actually changed
      if (newValue !== lastCommittedValue.current) {
        lastCommittedValue.current = newValue;
        onChange(newValue);
      }
    });
  }, [onChange]);
  
  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  const percentage = ((localValue - min) / (max - min)) * 100;
  const isCenter = min < 0;

  return (
    <div className="group">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600">{label}</span>
        <span className="text-xs tabular-nums text-gray-400">{localValue}</span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-gray-200">
        {/* Track fill */}
        <div
          className="absolute h-full rounded-full bg-gray-900"
          style={{
            left: isCenter ? "50%" : "0%",
            width: isCenter
              ? `${Math.abs(percentage - 50)}%`
              : `${percentage}%`,
            transform: isCenter && localValue < 0 ? "translateX(-100%)" : "none",
          }}
        />
        {/* Input */}
        <input
        aria-label="range"
          type="range"
          min={min}
          max={max}
          value={localValue}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-900 [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </h3>
  );
}

function ActionButton({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-all hover:bg-gray-200 hover:text-gray-900"
    >
      {children}
    </button>
  );
}

export function AdjustmentsPanel({
  adjustments,
  onAdjustmentsChange,
  onRotate,
  onFlipX,
  onFlipY,
}: AdjustmentsPanelProps) {
  const handleAdjustmentChange = (key: keyof Adjustments, value: number) => {
    onAdjustmentsChange({ [key]: value });
  };

  const handleResetAdjustments = () => {
    onAdjustmentsChange(DEFAULT_ADJUSTMENTS);
  };

  const adjustmentSliders: {
    key: keyof Adjustments;
    label: string;
    min: number;
    max: number;
  }[] = [
    { key: "exposure", label: "Exposure", min: -100, max: 100 },
    { key: "brightness", label: "Brightness", min: -100, max: 100 },
    { key: "contrast", label: "Contrast", min: -100, max: 100 },
    { key: "highlights", label: "Highlights", min: -100, max: 100 },
    { key: "shadows", label: "Shadows", min: -100, max: 100 },
    { key: "saturation", label: "Saturation", min: -100, max: 100 },
    { key: "vibrance", label: "Vibrance", min: -100, max: 100 },
    { key: "temperature", label: "Temperature", min: -100, max: 100 },
    { key: "tint", label: "Tint", min: -100, max: 100 },
    { key: "hue", label: "Hue", min: -180, max: 180 },
    { key: "sharpness", label: "Sharpness", min: 0, max: 100 },
    { key: "blur", label: "Blur", min: 0, max: 100 },
    { key: "vignette", label: "Vignette", min: 0, max: 100 },
    { key: "sepia", label: "Sepia", min: 0, max: 100 },
    { key: "grayscale", label: "Grayscale", min: 0, max: 100 },
  ];

  return (
    <div className="flex h-full w-full md:w-72 flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-white max-h-[50vh] md:max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 md:py-3">
        <h2 className="text-sm font-semibold text-gray-900">Adjustments</h2>
        <button
          onClick={handleResetAdjustments}
          className="text-xs text-gray-500 transition-colors hover:text-gray-900"
        >
          Reset All
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {/* Transform section */}
        <div className="mb-4 md:mb-6">
          <SectionTitle>Transform</SectionTitle>
          <div className="flex items-center gap-2">
            <ActionButton onClick={() => onRotate(-90)} title="Rotate Left">
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
                  d="M15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0112 0v3"
                />
              </svg>
            </ActionButton>
            <ActionButton onClick={() => onRotate(90)} title="Rotate Right">
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
                  d="M9 15l6 6m0 0l6-6m-6 6V9a6 6 0 00-12 0v3"
                />
              </svg>
            </ActionButton>
            <ActionButton onClick={onFlipX} title="Flip Horizontal">
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
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
            </ActionButton>
            <ActionButton onClick={onFlipY} title="Flip Vertical">
              <svg
                className="h-4 w-4 rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
                />
              </svg>
            </ActionButton>
          </div>
        </div>

        {/* Light section */}
        <div className="mb-4 md:mb-6">
          <SectionTitle>Light</SectionTitle>
          <div className="space-y-3 md:space-y-4">
            {adjustmentSliders.slice(0, 5).map((slider) => (
              <Slider
                key={slider.key}
                label={slider.label}
                value={adjustments[slider.key]}
                min={slider.min}
                max={slider.max}
                onChange={(value) => handleAdjustmentChange(slider.key, value)}
              />
            ))}
          </div>
        </div>

        {/* Color section */}
        <div className="mb-4 md:mb-6">
          <SectionTitle>Color</SectionTitle>
          <div className="space-y-3 md:space-y-4">
            {adjustmentSliders.slice(5, 10).map((slider) => (
              <Slider
                key={slider.key}
                label={slider.label}
                value={adjustments[slider.key]}
                min={slider.min}
                max={slider.max}
                onChange={(value) => handleAdjustmentChange(slider.key, value)}
              />
            ))}
          </div>
        </div>

        {/* Effects section */}
        <div className="mb-4 md:mb-6">
          <SectionTitle>Effects</SectionTitle>
          <div className="space-y-3 md:space-y-4">
            {adjustmentSliders.slice(10).map((slider) => (
              <Slider
                key={slider.key}
                label={slider.label}
                value={adjustments[slider.key]}
                min={slider.min}
                max={slider.max}
                onChange={(value) => handleAdjustmentChange(slider.key, value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
