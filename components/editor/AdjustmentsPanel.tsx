"use client";

import React from "react";
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
  const percentage = ((value - min) / (max - min)) * 100;
  const isCenter = min < 0;

  return (
    <div className="group">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-white/70">{label}</span>
        <span className="text-xs tabular-nums text-white/50">{value}</span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-white/10">
        {/* Track fill */}
        <div
          className="absolute h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all"
          style={{
            left: isCenter ? "50%" : "0%",
            width: isCenter
              ? `${Math.abs(percentage - 50)}%`
              : `${percentage}%`,
            transform: isCenter && value < 0 ? "translateX(-100%)" : "none",
          }}
        />
        {/* Input */}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-black/30 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
        />
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
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
      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
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
    <div className="flex h-full w-72 flex-col border-l border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Adjustments</h2>
        <button
          onClick={handleResetAdjustments}
          className="text-xs text-white/50 transition-colors hover:text-white"
        >
          Reset All
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Transform section */}
        <div className="mb-6">
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
        <div className="mb-6">
          <SectionTitle>Light</SectionTitle>
          <div className="space-y-4">
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
        <div className="mb-6">
          <SectionTitle>Color</SectionTitle>
          <div className="space-y-4">
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
        <div className="mb-6">
          <SectionTitle>Effects</SectionTitle>
          <div className="space-y-4">
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
