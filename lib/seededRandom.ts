/**
 * Small deterministic pseudo-random number generator.
 *
 * We deliberately do NOT use Math.random() for artwork generation.
 *
 * Using a seeded generator means:
 *
 * same seed
 * + same settings
 * = same artwork
 *
 * every time.
 */
export function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return function random(): number {
    state += 0x6d2b79f5;

    let t = state;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a random floating-point number between min and max.
 */
export function randomBetween(
  random: () => number,
  min: number,
  max: number
): number {
  return min + random() * (max - min);
}

/**
 * Returns an integer between min and max, inclusive.
 */
export function randomInteger(
  random: () => number,
  min: number,
  max: number
): number {
  return Math.floor(randomBetween(random, min, max + 1));
}
