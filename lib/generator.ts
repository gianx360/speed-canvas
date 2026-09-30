import type {
  Artwork,
  ArtworkSettings,
  PaletteColour,
  Streak,
  ThicknessDistribution,
} from "@/types/artwork";

import {
  createSeededRandom,
  randomInteger,
} from "@/lib/seededRandom";

import { varyColour } from "@/lib/colour";

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(
    Math.max(value, min),
    max
  );
}

function normaliseSettings(
  settings: ArtworkSettings
): ArtworkSettings {
  if (settings.width <= 0) {
    throw new Error(
      "Artwork width must be greater than zero."
    );
  }

  if (settings.height <= 0) {
    throw new Error(
      "Artwork height must be greater than zero."
    );
  }

  if (settings.palette.length === 0) {
    throw new Error(
      "At least one palette colour is required."
    );
  }

  const minLineHeight = Math.max(
    1,
    Math.floor(settings.minLineHeight)
  );

  const maxLineHeight = Math.max(
    minLineHeight,
    Math.floor(settings.maxLineHeight)
  );

  const palette = settings.palette.map(
    (item) => ({
      ...item,
      weight: Math.max(0, item.weight),
    })
  );

  return {
    ...settings,

    seed: Math.floor(settings.seed),

    width: Math.floor(settings.width),
    height: Math.floor(settings.height),

    palette,

    minLineHeight,
    maxLineHeight,

    persistence: clamp(
      settings.persistence,
      0,
      1
    ),

    colourVariation: clamp(
      settings.colourVariation,
      0,
      1
    ),
  };
}

/**
 * Select a palette entry using its relative weight.
 */
function chooseWeightedPaletteIndex(
  palette: PaletteColour[],
  random: () => number
): number {
  const totalWeight = palette.reduce(
    (total, item) =>
      total + Math.max(0, item.weight),
    0
  );

  /**
   * If somebody sets every weight to zero,
   * fall back to an ordinary random choice.
   */
  if (totalWeight <= 0) {
    return randomInteger(
      random,
      0,
      palette.length - 1
    );
  }

  let target =
    random() * totalWeight;

  for (
    let index = 0;
    index < palette.length;
    index++
  ) {
    target -= Math.max(
      0,
      palette[index].weight
    );

    if (target <= 0) {
      return index;
    }
  }

  return palette.length - 1;
}

/**
 * Convert a 0–1 random number into a different
 * distribution curve.
 */
function transformDistribution(
  value: number,
  distribution: ThicknessDistribution,
  random: () => number
): number {
  switch (distribution) {
    /**
     * Every thickness has approximately
     * equal probability.
     */
    case "uniform":
      return value;

    /**
     * Strong bias toward thinner streaks.
     */
    case "fine":
      return Math.pow(value, 2.8);

    /**
     * Moderate bias toward thinner streaks.
     */
    case "balanced":
      return Math.pow(value, 1.5);

    /**
     * Bias toward thicker streaks.
     */
    case "heavy":
      return Math.pow(value, 0.55);

    /**
     * Mostly extremely fine streaks,
     * occasionally interrupted by large bands.
     */
    case "extreme": {
      const largeBand =
        random() < 0.08;

      if (largeBand) {
        return (
          0.65 +
          random() * 0.35
        );
      }

      return Math.pow(value, 4.5);
    }

    default:
      return value;
  }
}

function chooseStreakHeight(
  random: () => number,
  min: number,
  max: number,
  distribution: ThicknessDistribution
): number {
  if (min === max) {
    return min;
  }

  const baseRandom = random();

  const transformed =
    transformDistribution(
      baseRandom,
      distribution,
      random
    );

  const height =
    min +
    transformed * (max - min);

  return Math.max(
    min,
    Math.round(height)
  );
}

export function generateArtwork(
  inputSettings: ArtworkSettings
): Artwork {
  const settings =
    normaliseSettings(inputSettings);

  const random =
    createSeededRandom(settings.seed);

  const streaks: Streak[] = [];

  let y = 0;

  let previousPaletteIndex:
    | number
    | null = null;

  while (y < settings.height) {
    let paletteIndex: number;

    /**
     * Persistence determines whether we stay
     * within the previous colour family.
     */
    const shouldPersist =
      previousPaletteIndex !== null &&
      random() < settings.persistence;

    if (shouldPersist) {
      paletteIndex =
        previousPaletteIndex;
    } else {
      paletteIndex =
        chooseWeightedPaletteIndex(
          settings.palette,
          random
        );
    }

    const paletteColour =
      settings.palette[
        paletteIndex
      ].colour;

    let streakHeight =
      chooseStreakHeight(
        random,
        settings.minLineHeight,
        settings.maxLineHeight,
        settings.thicknessDistribution
      );

    /**
     * Trim the final streak precisely
     * to the bottom of the artwork.
     */
    if (
      y + streakHeight >
      settings.height
    ) {
      streakHeight =
        settings.height - y;
    }

    const finalColour =
      varyColour(
        paletteColour,
        settings.colourVariation,
        random
      );

    streaks.push({
      y,
      height: streakHeight,
      colour: finalColour,
      paletteIndex,
    });

    y += streakHeight;

    previousPaletteIndex =
      paletteIndex;
  }

  return {
    settings,
    streaks,
  };
}


