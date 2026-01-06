import { FilterPreset, Adjustments } from "./types";

export const FILTER_PRESETS: FilterPreset[] = [
  {
    id: "none",
    name: "Original",
    adjustments: {},
  },
  {
    id: "vivid",
    name: "Vivid",
    adjustments: {
      saturation: 30,
      contrast: 15,
      vibrance: 25,
    },
  },
  {
    id: "dramatic",
    name: "Dramatic",
    adjustments: {
      contrast: 40,
      shadows: -20,
      highlights: 20,
      saturation: 10,
    },
  },
  {
    id: "mono",
    name: "Mono",
    adjustments: {
      grayscale: 100,
      contrast: 10,
    },
  },
  {
    id: "noir",
    name: "Noir",
    adjustments: {
      grayscale: 100,
      contrast: 30,
      shadows: -30,
      highlights: 20,
    },
  },
  {
    id: "silvertone",
    name: "Silvertone",
    adjustments: {
      grayscale: 100,
      contrast: 5,
      brightness: 10,
    },
  },
  {
    id: "sepia",
    name: "Sepia",
    adjustments: {
      sepia: 80,
      contrast: 5,
    },
  },
  {
    id: "vintage",
    name: "Vintage",
    adjustments: {
      sepia: 30,
      contrast: -10,
      brightness: 5,
      vignette: 30,
    },
  },
  {
    id: "fade",
    name: "Fade",
    adjustments: {
      contrast: -20,
      saturation: -15,
      brightness: 10,
    },
  },
  {
    id: "cool",
    name: "Cool",
    adjustments: {
      temperature: -30,
      tint: -10,
      saturation: 5,
      hue: -10,
    },
  },
  {
    id: "warm",
    name: "Warm",
    adjustments: {
      temperature: 30,
      tint: 10,
      saturation: 10,
      hue: 10,
    },
  },
  {
    id: "golden",
    name: "Golden",
    adjustments: {
      temperature: 40,
      highlights: 20,
      saturation: 15,
      contrast: 10,
      sepia: 20,
    },
  },
  {
    id: "cinematic",
    name: "Cinematic",
    adjustments: {
      contrast: 20,
      saturation: -10,
      temperature: -10,
      shadows: -15,
      vignette: 25,
    },
  },
  {
    id: "matte",
    name: "Matte",
    adjustments: {
      contrast: -15,
      shadows: 20,
      saturation: -10,
    },
  },
  {
    id: "punch",
    name: "Punch",
    adjustments: {
      contrast: 25,
      saturation: 20,
      vibrance: 30,
      sharpness: 20,
    },
  },
  {
    id: "dreamy",
    name: "Dreamy",
    adjustments: {
      brightness: 15,
      contrast: -10,
      saturation: -5,
      blur: 5,
      highlights: 20,
    },
  },
  {
    id: "retro",
    name: "Retro",
    adjustments: {
      sepia: 40,
      saturation: -20,
      contrast: 10,
      vignette: 20,
    },
  },
  {
    id: "neon",
    name: "Neon",
    adjustments: {
      saturation: 50,
      contrast: 30,
      vibrance: 40,
      hue: 20,
    },
  },
  {
    id: "invert",
    name: "Invert",
    adjustments: {
      invert: 100,
    },
  },
];

// Apply adjustments to get CSS filter string
export function getFilterString(adjustments: Adjustments): string {
  const filters: string[] = [];

  // Brightness: 0 = 100%, -100 = 0%, 100 = 200%
  const brightness = 1 + adjustments.brightness / 100;
  filters.push(`brightness(${brightness})`);

  // Contrast: 0 = 100%, -100 = 0%, 100 = 200%
  const contrast = 1 + adjustments.contrast / 100;
  filters.push(`contrast(${contrast})`);

  // Saturation: 0 = 100%, -100 = 0%, 100 = 200%
  const saturation = 1 + adjustments.saturation / 100;
  filters.push(`saturate(${saturation})`);

  // Hue rotation
  if (adjustments.hue !== 0) {
    filters.push(`hue-rotate(${adjustments.hue}deg)`);
  }

  // Sepia
  if (adjustments.sepia > 0) {
    filters.push(`sepia(${adjustments.sepia / 100})`);
  }

  // Grayscale
  if (adjustments.grayscale > 0) {
    filters.push(`grayscale(${adjustments.grayscale / 100})`);
  }

  // Invert
  if (adjustments.invert > 0) {
    filters.push(`invert(${adjustments.invert / 100})`);
  }

  // Blur
  if (adjustments.blur > 0) {
    filters.push(`blur(${adjustments.blur / 10}px)`);
  }

  return filters.join(" ");
}

// Get filter adjustments for preview
export function getPreviewFilterString(
  adjustments: Partial<Adjustments>
): string {
  const defaultAdj: Adjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    exposure: 0,
    highlights: 0,
    shadows: 0,
    temperature: 0,
    tint: 0,
    vibrance: 0,
    sharpness: 0,
    blur: 0,
    vignette: 0,
    hue: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
  };

  return getFilterString({ ...defaultAdj, ...adjustments });
}
