"use client";

import { useMemo, useState } from "react";

import ArtCanvas from "@/components/ArtCanvas";
import ControlPanel from "@/components/ControlPanel";

import ExportPanel from "@/components/ExportPanel";

import { generateArtwork } from "@/lib/generator";

import type { ArtworkSettings } from "@/types/artwork";

import styles from "./page.module.css";

const INITIAL_SETTINGS: ArtworkSettings = {
  seed: 839251,

  width: 3000,
  height: 2000,

  palette: [
    {
      id: "blue",
      colour: "#172A3A",
      weight: 20,
    },
    {
      id: "green",
      colour: "#436436",
      weight: 35,
    },
    {
      id: "earth",
      colour: "#9B6A35",
      weight: 18,
    },
    {
      id: "gold",
      colour: "#D9B44A",
      weight: 10,
    },
    {
      id: "light",
      colour: "#DAD7CD",
      weight: 5,
    },
  ],

  minLineHeight: 2,
  maxLineHeight: 90,

  thicknessDistribution: "fine",

  persistence: 0.35,

  colourVariation: 0.08,
};

export default function Home() {
  const [settings, setSettings] =
    useState<ArtworkSettings>(
      INITIAL_SETTINGS
    );

  const artwork = useMemo(
    () => generateArtwork(settings),
    [settings]
  );

  function generateNewComposition() {
    setSettings((current) => ({
      ...current,
      seed: Math.floor(
        Math.random() * 2_147_483_647
      ),
    }));
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.brandLine}>
            <span className={styles.byline}>SPEED CANVAS   by Gianx-labs</span>
          </div>

          <h1>
            Studies in colour,
            <br />
            motion &amp; velocity.
          </h1>
        </div>

        <div className={styles.headerMeta}>
          GENERATIVE ART SYSTEM
          <br />
          V0.2
        </div>
      </header>

            <a href="/about/" className={styles.aboutLink}>
              About this experiment ↗
            </a>

      <div className={styles.workspace}>
        <div className={styles.sidebar}>
  <ControlPanel
    settings={settings}
    onChange={setSettings}
    onNewComposition={
      generateNewComposition
    }
  />

  <ExportPanel
    artwork={artwork}
  />
</div>

        <section
          className={styles.canvasArea}
        >
          <div className={styles.canvasToolbar}>
            <div>
              <span>LIVE COMPOSITION</span>

              <strong>
                {settings.width.toLocaleString()}
                {" × "}
                {settings.height.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>SEED</span>

              <strong>{settings.seed}</strong>
            </div>
          </div>

          <div
            className={styles.canvasStage}
          >
            <div
              className={styles.artworkFrame}
              style={{
                aspectRatio: `${settings.width} / ${settings.height}`,
              }}
            >
              <ArtCanvas
                artwork={artwork}
              />
            </div>
          </div>

          <div
            className={styles.canvasFooter}
          >
            <span>
              {
                artwork.streaks.length
              }{" "}
              STREAKS
            </span>

            <span>
              SVG VECTOR PREVIEW
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}


