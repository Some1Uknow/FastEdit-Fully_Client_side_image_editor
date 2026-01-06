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
    <div className="flex h-full w-full md:w-72 flex-col border-t md:border-t-0 md:border-l border-gray-200 bg-white max-h-[50vh] md:max-h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2 md:py-3">
        <h2 className="text-sm font-semibold text-gray-900">Text</h2>
        <button
          onClick={onAddText}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900"
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
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        {/* Text input */}
        <div className="mb-4 md:mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
            className="h-24 w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>

        {/* Font family */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
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
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
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
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
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
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
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
                    ? "bg-gray-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              <svg
                className="h-4 w-4 text-gray-600"
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
                    ? "bg-gray-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              <svg
                className="h-4 w-4 text-gray-600"
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
                    ? "bg-gray-200"
                    : "bg-gray-100 hover:bg-gray-200"
                }
              `}
            >
              <svg
                className="h-4 w-4 text-gray-600"
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
        <div className="mb-4 md:mb-6">
          <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                  aspect-square rounded-lg border transition-all
                  ${
                    (selectedText?.color ?? settings.color) === color
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
              value={selectedText?.color ?? settings.color}
              onChange={(e) => {
                if (selectedText) {
                  onUpdateText(selectedText.id, { color: e.target.value });
                } else {
                  onSettingsChange({ color: e.target.value });
                }
              }}
              className="h-8 w-full cursor-pointer rounded-lg border border-gray-200 bg-transparent"
            />
          </div>
        </div>

        {/* Text layers */}
        {texts.length > 0 && (
          <div className="mb-4 md:mb-6">
            <h3 className="mb-2 md:mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                        ? "bg-gray-200"
                        : "bg-gray-100 hover:bg-gray-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className="h-4 w-4 rounded border border-gray-300"
                      style={{ backgroundColor: text.color }}
                    />
                    <span className="truncate text-xs text-gray-600">
                      {text.text || "Empty text"}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveText(text.id);
                    }}
                    className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-300 hover:text-gray-700"
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
        <div className="rounded-lg bg-gray-50 p-3 hidden md:block">
          <h4 className="mb-2 text-xs font-medium text-gray-700">Tips</h4>
          <ul className="space-y-1 text-xs text-gray-500">
            <li>• Click on canvas to place text</li>
            <li>• Drag text to reposition</li>
            <li>• Select text layer to edit</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
