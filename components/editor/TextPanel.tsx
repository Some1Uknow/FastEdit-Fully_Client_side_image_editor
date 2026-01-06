"use client";

import React from "react";
import { TextSettings, TextOverlay } from "@/lib/types";

interface TextPanelProps {
  settings: TextSettings;
  onSettingsChange: (settings: Partial<TextSettings>) => void;
  texts: TextOverlay[];
  selectedTextId: string | null;
  onSelectText: (id: string | null) => void;
  onUpdateText: (id: string, updates: Partial<TextOverlay>) => void;
  onRemoveText: (id: string) => void;
  onAddText: () => void;
}

const FONTS = [
  "Inter",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Impact",
  "Comic Sans MS",
];

const FONT_SIZES = [16, 24, 32, 48, 64, 96, 128];

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

export function TextPanel({
  settings,
  onSettingsChange,
  texts,
  selectedTextId,
  onSelectText,
  onUpdateText,
  onRemoveText,
  onAddText,
}: TextPanelProps) {
  const selectedText = texts.find((t) => t.id === selectedTextId);

  return (
    <div className="flex h-full w-72 flex-col border-l border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Text</h2>
        <button
          onClick={onAddText}
          className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs text-white/70 transition-colors hover:bg-white/20 hover:text-white"
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Text
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Text input */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Text Content
          </h3>
          <textarea
            value={selectedText?.text ?? settings.text}
            onChange={(e) => {
              if (selectedText) {
                onUpdateText(selectedText.id, { text: e.target.value });
              } else {
                onSettingsChange({ text: e.target.value });
              }
            }}
            placeholder="Enter your text..."
            className="h-24 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-white/30 focus:outline-none"
          />
        </div>

        {/* Font family */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Font
          </h3>
          <select
            value={selectedText?.fontFamily ?? settings.fontFamily}
            onChange={(e) => {
              if (selectedText) {
                onUpdateText(selectedText.id, { fontFamily: e.target.value });
              } else {
                onSettingsChange({ fontFamily: e.target.value });
              }
            }}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
          >
            {FONTS.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Font size */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Size
          </h3>
          <div className="flex flex-wrap gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => {
                  if (selectedText) {
                    onUpdateText(selectedText.id, { fontSize: size });
                  } else {
                    onSettingsChange({ fontSize: size });
                  }
                }}
                className={`
                  rounded-lg px-3 py-1.5 text-xs font-medium transition-all
                  ${
                    (selectedText?.fontSize ?? settings.fontSize) === size
                      ? "bg-white text-black"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Style options */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Style
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newBold = !(selectedText?.bold ?? settings.bold);
                if (selectedText) {
                  onUpdateText(selectedText.id, { bold: newBold });
                } else {
                  onSettingsChange({ bold: newBold });
                }
              }}
              className={`
                flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all
                ${
                  (selectedText?.bold ?? settings.bold)
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              B
            </button>
            <button
              onClick={() => {
                const newItalic = !(selectedText?.italic ?? settings.italic);
                if (selectedText) {
                  onUpdateText(selectedText.id, { italic: newItalic });
                } else {
                  onSettingsChange({ italic: newItalic });
                }
              }}
              className={`
                flex h-10 w-10 items-center justify-center rounded-lg text-sm italic transition-all
                ${
                  (selectedText?.italic ?? settings.italic)
                    ? "bg-white text-black"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              I
            </button>
            <div className="flex-1" />
            <button
              onClick={() => {
                if (selectedText) {
                  onUpdateText(selectedText.id, { align: "left" });
                } else {
                  onSettingsChange({ align: "left" });
                }
              }}
              className={`
                flex h-10 w-10 items-center justify-center rounded-lg transition-all
                ${
                  (selectedText?.align ?? settings.align) === "left"
                    ? "bg-white/20"
                    : "bg-white/5 hover:bg-white/10"
                }
              `}
            >
              <svg
                className="h-4 w-4 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h10.5m-10.5 5.25h16.5"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                if (selectedText) {
                  onUpdateText(selectedText.id, { align: "center" });
                } else {
                  onSettingsChange({ align: "center" });
                }
              }}
              className={`
                flex h-10 w-10 items-center justify-center rounded-lg transition-all
                ${
                  (selectedText?.align ?? settings.align) === "center"
                    ? "bg-white/20"
                    : "bg-white/5 hover:bg-white/10"
                }
              `}
            >
              <svg
                className="h-4 w-4 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M6.75 12h10.5M3.75 17.25h16.5"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                if (selectedText) {
                  onUpdateText(selectedText.id, { align: "right" });
                } else {
                  onSettingsChange({ align: "right" });
                }
              }}
              className={`
                flex h-10 w-10 items-center justify-center rounded-lg transition-all
                ${
                  (selectedText?.align ?? settings.align) === "right"
                    ? "bg-white/20"
                    : "bg-white/5 hover:bg-white/10"
                }
              `}
            >
              <svg
                className="h-4 w-4 text-white/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M6.75 12h10.5m3 5.25H3.75"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Color */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Color
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                onClick={() => {
                  if (selectedText) {
                    onUpdateText(selectedText.id, { color });
                  } else {
                    onSettingsChange({ color });
                  }
                }}
                className={`
                  aspect-square rounded-lg transition-all
                  ${
                    (selectedText?.color ?? settings.color) === color
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
              value={selectedText?.color ?? settings.color}
              onChange={(e) => {
                if (selectedText) {
                  onUpdateText(selectedText.id, { color: e.target.value });
                } else {
                  onSettingsChange({ color: e.target.value });
                }
              }}
              className="h-8 w-full cursor-pointer rounded-lg border-0 bg-transparent"
            />
          </div>
        </div>

        {/* Text layers */}
        {texts.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
              Text Layers
            </h3>
            <div className="space-y-2">
              {texts.map((text) => (
                <div
                  key={text.id}
                  onClick={() => onSelectText(text.id)}
                  className={`
                    flex cursor-pointer items-center justify-between rounded-lg p-2 transition-all
                    ${
                      selectedTextId === text.id
                        ? "bg-white/20"
                        : "bg-white/5 hover:bg-white/10"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className="h-4 w-4 rounded"
                      style={{ backgroundColor: text.color }}
                    />
                    <span className="truncate text-xs text-white/70">
                      {text.text || "Empty text"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveText(text.id);
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
            <li>• Click on canvas to place text</li>
            <li>• Drag text to reposition</li>
            <li>• Select text layer to edit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
