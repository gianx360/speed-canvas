export type ThicknessDistribution =
  | "uniform"
  | "fine"
  | "balanced"
  | "heavy"
  | "extreme";

export type PaletteColour = {
  id: string;
  colour: string;

  /**
   * Relative probability of this colour being selected.
   *
   * These values do NOT have to add to 100.
   *
   * Example:
   *
   * Green  = 50
   * Blue   = 20
   * Yellow = 10
   *
   * becomes:
   *
   * Green  = 62.5%
   * Blue   = 25%
   * Yellow = 12.5%
   */
  weight: number;
};

export type ArtworkSettings = {
  seed: number;

  width: number;
  height: number;

  palette: PaletteColour[];

  minLineHeight: number;
  maxLineHeight: number;

  thicknessDistribution: ThicknessDistribution;

  persistence: number;

  colourVariation: number;
};

export type Streak = {
  y: number;
  height: number;
  colour: string;
  paletteIndex: number;
};

export type Artwork = {
  settings: ArtworkSettings;
  streaks: Streak[];
};
