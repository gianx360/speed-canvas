type RGB = {
  r: number;
  g: number;
  b: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts:
 *
 * #FFAA00
 *
 * into:
 *
 * { r: 255, g: 170, b: 0 }
 */
export function hexToRgb(hex: string): RGB {
  const cleaned = hex.replace("#", "");

  if (cleaned.length !== 6) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }

  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

/**
 * Converts RGB back into a hexadecimal colour.
 */
export function rgbToHex({ r, g, b }: RGB): string {
  const componentToHex = (value: number) =>
    Math.round(clamp(value, 0, 255))
      .toString(16)
      .padStart(2, "0");

  return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

/**
 * Applies a controlled amount of random brightness variation.
 *
 * amount:
 *
 * 0    = no variation
 * 0.05 = extremely subtle
 * 0.10 = subtle
 * 0.25 = strong
 * 0.50 = extreme
 */
export function varyColour(
  hex: string,
  amount: number,
  random: () => number
): string {
  if (amount <= 0) {
    return hex;
  }

  const rgb = hexToRgb(hex);

  /**
   * Generate one shared brightness shift.
   *
   * Using one shift for all RGB channels preserves the basic
   * character of the original colour better than independently
   * randomising red, green and blue.
   */
  const shift = (random() * 2 - 1) * 255 * amount;

  return rgbToHex({
    r: rgb.r + shift,
    g: rgb.g + shift,
    b: rgb.b + shift,
  });
}
