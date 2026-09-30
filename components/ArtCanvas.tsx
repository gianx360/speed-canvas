import type { Artwork } from "@/types/artwork";

type ArtCanvasProps = {
  artwork: Artwork;
};

export default function ArtCanvas({
  artwork,
}: ArtCanvasProps) {
  const {
    settings,
    streaks,
  } = artwork;

  return (
    <svg
      viewBox={`0 0 ${settings.width} ${settings.height}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Generated horizontal streak artwork"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
      }}
      preserveAspectRatio="xMidYMid meet"
    >
      {streaks.map((streak, index) => (
        <rect
          key={`${streak.y}-${index}`}
          x={0}
          y={streak.y}
          width={settings.width}
          height={streak.height}
          fill={streak.colour}
        />
      ))}
    </svg>
  );
}
