"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  Artwork,
} from "@/types/artwork";

import {
  downloadRaster,
  downloadSvg,
} from "@/lib/exportArtwork";

type ExportPanelProps = {
  artwork: Artwork;
};

type ExportFormat =
  | "svg"
  | "png"
  | "jpeg";

export default function ExportPanel({
  artwork,
}: ExportPanelProps) {
  const [format, setFormat] =
    useState<ExportFormat>("png");

  const [width, setWidth] =
    useState(
      artwork.settings.width
    );

  const [height, setHeight] =
    useState(
      artwork.settings.height
    );

  const [quality, setQuality] =
    useState(100);

  const [isExporting, setIsExporting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(
      null
    );

  const megapixels =
    useMemo(() => {
      return (
        (width * height) /
        1_000_000
      );
    }, [width, height]);

  const aspectRatio =
    artwork.settings.width /
    artwork.settings.height;

  function changeWidth(
    newWidth: number
  ) {
    const safeWidth =
      Math.max(
        1,
        Math.round(newWidth)
      );

    setWidth(safeWidth);

    setHeight(
      Math.max(
        1,
        Math.round(
          safeWidth /
            aspectRatio
        )
      )
    );
  }

  function changeHeight(
    newHeight: number
  ) {
    const safeHeight =
      Math.max(
        1,
        Math.round(newHeight)
      );

    setHeight(safeHeight);

    setWidth(
      Math.max(
        1,
        Math.round(
          safeHeight *
            aspectRatio
        )
      )
    );
  }

  function applyScale(
    multiplier: number
  ) {
    setWidth(
      Math.round(
        artwork.settings.width *
          multiplier
      )
    );

    setHeight(
      Math.round(
        artwork.settings.height *
          multiplier
      )
    );
  }

  async function exportArtwork() {
    setError(null);

    setIsExporting(true);

    try {
      if (format === "svg") {
        downloadSvg(
          artwork,
          width,
          height
        );
      } else {
        await downloadRaster(
          artwork,
          format,
          width,
          height,
          quality / 100
        );
      }
    } catch (caughtError) {
      if (
        caughtError instanceof
        Error
      ) {
        setError(
          caughtError.message
        );
      } else {
        setError(
          "Something went wrong during export."
        );
      }
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <section className="exportPanel">
      <div className="exportHeader">
        <div>
          <span className="eyebrow">
            OUTPUT
          </span>

          <h2>
            Export artwork
          </h2>
        </div>

        <span className="exportMegapixels">
          {megapixels.toFixed(1)} MP
        </span>
      </div>

      <div className="exportSection">
        <label className="controlLabel">
          Format
        </label>

        <div className="formatGrid">
          <button
            type="button"
            className={
              format === "svg"
                ? "formatButton active"
                : "formatButton"
            }
            onClick={() =>
              setFormat("svg")
            }
          >
            <strong>SVG</strong>
            <span>VECTOR</span>
          </button>

          <button
            type="button"
            className={
              format === "png"
                ? "formatButton active"
                : "formatButton"
            }
            onClick={() =>
              setFormat("png")
            }
          >
            <strong>PNG</strong>
            <span>LOSSLESS</span>
          </button>

          <button
            type="button"
            className={
              format === "jpeg"
                ? "formatButton active"
                : "formatButton"
            }
            onClick={() =>
              setFormat("jpeg")
            }
          >
            <strong>JPEG</strong>
            <span>COMPRESSED</span>
          </button>
        </div>
      </div>

      <div className="exportSection">
        <label className="controlLabel">
          Output resolution
        </label>

        <div className="dimensionGrid">
          <div>
            <span className="miniLabel">
              WIDTH
            </span>

            <input
              className="numberInput"
              type="number"
              min="1"
              value={width}
              onChange={(event) =>
                changeWidth(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </div>

          <div>
            <span className="miniLabel">
              HEIGHT
            </span>

            <input
              className="numberInput"
              type="number"
              min="1"
              value={height}
              onChange={(event) =>
                changeHeight(
                  Number(
                    event.target
                      .value
                  )
                )
              }
            />
          </div>
        </div>

        <div className="exportScaleGrid">
          <button
            type="button"
            onClick={() =>
              applyScale(1)
            }
          >
            1×
          </button>

          <button
            type="button"
            onClick={() =>
              applyScale(2)
            }
          >
            2×
          </button>

          <button
            type="button"
            onClick={() =>
              applyScale(4)
            }
          >
            4×
          </button>

          <button
            type="button"
            onClick={() =>
              applyScale(8)
            }
          >
            8×
          </button>
        </div>

        <p className="exportInfo">
          {width.toLocaleString()}
          {" × "}
          {height.toLocaleString()}
          {" pixels · "}
          {megapixels.toFixed(1)}
          {" megapixels"}
        </p>
      </div>

      {format === "jpeg" && (
        <div className="exportSection">
          <div className="sectionTitleRow">
            <label className="controlLabel">
              JPEG quality
            </label>

            <span className="controlValue">
              {quality}%
            </span>
          </div>

          <input
            className="rangeInput"
            type="range"
            min="50"
            max="100"
            step="1"
            value={quality}
            onChange={(event) =>
              setQuality(
                Number(
                  event.target.value
                )
              )
            }
          />
        </div>
      )}

      {format === "svg" && (
        <div className="vectorNotice">
          <strong>
            VECTOR MASTER
          </strong>

          <p>
            SVG preserves the
            composition as vector
            geometry and can be
            enlarged without raster
            pixelation.
          </p>
        </div>
      )}

      {megapixels > 80 &&
        format !== "svg" && (
          <div className="exportWarning">
            This raster image is too
            large for safe browser
            export. Choose SVG or
            reduce the resolution.
          </div>
        )}

      {error && (
        <div className="exportError">
          {error}
        </div>
      )}

      <button
        type="button"
        className="exportButton"
        disabled={isExporting}
        onClick={
          exportArtwork
        }
      >
        {isExporting
          ? "Rendering…"
          : `Export ${format.toUpperCase()}`}
      </button>
    </section>
  );
}


