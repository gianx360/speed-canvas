import type { Artwork } from "@/types/artwork";

export type RasterFormat = "png" | "jpeg";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convert an artwork into a complete standalone SVG document.
 *
 * Because every streak is represented as vector geometry,
 * SVG is our preferred archival/master format.
 */
export function artworkToSvg(
  artwork: Artwork,
  outputWidth = artwork.settings.width,
  outputHeight = artwork.settings.height
): string {
  const { settings, streaks } = artwork;

  const scaleY =
    outputHeight / settings.height;

  const rectangles = streaks
    .map((streak) => {
      const y = streak.y * scaleY;
      const height =
        streak.height * scaleY;

      return `<rect x="0" y="${y}" width="${outputWidth}" height="${height}" fill="${escapeXml(
        streak.colour
      )}"/>`;
    })
    .join("");

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg`,
    ` xmlns="http://www.w3.org/2000/svg"`,
    ` width="${outputWidth}"`,
    ` height="${outputHeight}"`,
    ` viewBox="0 0 ${outputWidth} ${outputHeight}"`,
    ` shape-rendering="crispEdges"`,
    `>`,
    rectangles,
    `</svg>`,
  ].join("");
}

function downloadBlob(
  blob: Blob,
  filename: string
) {
  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function downloadSvg(
  artwork: Artwork,
  outputWidth = artwork.settings.width,
  outputHeight = artwork.settings.height
) {
  const svg = artworkToSvg(
    artwork,
    outputWidth,
    outputHeight
  );

  const blob = new Blob(
    [svg],
    {
      type: "image/svg+xml;charset=utf-8",
    }
  );

  downloadBlob(
    blob,
    `speed-canvas-${artwork.settings.seed}-${outputWidth}x${outputHeight}.svg`
  );
}

/**
 * Rasterise the SVG into a browser canvas.
 *
 * This lets the exact same vector composition become
 * PNG or JPEG at a user-selected output resolution.
 */
export async function downloadRaster(
  artwork: Artwork,
  format: RasterFormat,
  outputWidth: number,
  outputHeight: number,
  jpegQuality = 1
): Promise<void> {
  if (
    outputWidth <= 0 ||
    outputHeight <= 0
  ) {
    throw new Error(
      "Export dimensions must be greater than zero."
    );
  }

  /**
   * Protect the browser from accidentally allocating
   * absurd amounts of canvas memory.
   *
   * 80 million pixels at RGBA is already roughly
   * 320 MB of raw pixel memory before overhead.
   */
  const totalPixels =
    outputWidth * outputHeight;

  const MAX_PIXELS =
    80_000_000;

  if (totalPixels > MAX_PIXELS) {
    throw new Error(
      "This raster export is too large for safe browser rendering. Use SVG for extremely large artwork."
    );
  }

  const svg = artworkToSvg(
    artwork,
    outputWidth,
    outputHeight
  );

  const svgBlob = new Blob(
    [svg],
    {
      type: "image/svg+xml;charset=utf-8",
    }
  );

  const svgUrl =
    URL.createObjectURL(svgBlob);

  try {
    const image =
      await loadImage(svgUrl);

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      outputWidth;

    canvas.height =
      outputHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      throw new Error(
        "Could not create canvas rendering context."
      );
    }

    /**
     * Disable interpolation because our artwork
     * consists of intentionally hard horizontal
     * boundaries.
     */
    context.imageSmoothingEnabled =
      false;

    /**
     * JPEG cannot represent transparency.
     * White is therefore used as a safe base.
     */
    if (format === "jpeg") {
      context.fillStyle =
        "#ffffff";

      context.fillRect(
        0,
        0,
        outputWidth,
        outputHeight
      );
    }

    context.drawImage(
      image,
      0,
      0,
      outputWidth,
      outputHeight
    );

    const mimeType =
      format === "png"
        ? "image/png"
        : "image/jpeg";

    const quality =
      format === "jpeg"
        ? Math.min(
            Math.max(
              jpegQuality,
              0.1
            ),
            1
          )
        : undefined;

    const blob =
      await canvasToBlob(
        canvas,
        mimeType,
        quality
      );

    downloadBlob(
      blob,
      `speed-canvas-${artwork.settings.seed}-${outputWidth}x${outputHeight}.${format === "jpeg" ? "jpg" : "png"}`
    );
  } finally {
    URL.revokeObjectURL(
      svgUrl
    );
  }
}

function loadImage(
  src: string
): Promise<HTMLImageElement> {
  return new Promise(
    (resolve, reject) => {
      const image =
        new Image();

      image.onload = () =>
        resolve(image);

      image.onerror = () =>
        reject(
          new Error(
            "Could not load SVG for raster export."
          )
        );

      image.src = src;
    }
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise(
    (resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(
              new Error(
                "The browser could not create the image file."
              )
            );

            return;
          }

          resolve(blob);
        },
        mimeType,
        quality
      );
    }
  );
}
