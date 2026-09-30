"use client";

import type {
  ArtworkSettings,
  ThicknessDistribution,
} from "@/types/artwork";

type ControlPanelProps = {
  settings: ArtworkSettings;
  onChange: (
    settings: ArtworkSettings
  ) => void;
  onNewComposition: () => void;
};

const DEFAULT_COLOURS = [
  "#C44D58",
  "#4F6D7A",
  "#E8C547",
  "#7A8B5A",
  "#D9D2C3",
  "#8A5A44",
  "#6B5B95",
  "#3C787E",
];

const DISTRIBUTIONS: {
  value: ThicknessDistribution;
  label: string;
}[] = [
  {
    value: "fine",
    label: "Fine",
  },
  {
    value: "balanced",
    label: "Balanced",
  },
  {
    value: "uniform",
    label: "Uniform",
  },
  {
    value: "heavy",
    label: "Heavy",
  },
  {
    value: "extreme",
    label: "Extreme",
  },
];

export default function ControlPanel({
  settings,
  onChange,
  onNewComposition,
}: ControlPanelProps) {
  function update<
    K extends keyof ArtworkSettings
  >(
    key: K,
    value: ArtworkSettings[K]
  ) {
    onChange({
      ...settings,
      [key]: value,
    });
  }

  function updatePaletteColour(
    index: number,
    colour: string
  ) {
    const palette = [
      ...settings.palette,
    ];

    palette[index] = {
      ...palette[index],
      colour,
    };

    update("palette", palette);
  }

  function updateWeight(
    index: number,
    weight: number
  ) {
    const palette = [
      ...settings.palette,
    ];

    palette[index] = {
      ...palette[index],
      weight: Math.max(
        0,
        weight
      ),
    };

    update("palette", palette);
  }

  function addColour() {
    if (
      settings.palette.length >= 20
    ) {
      return;
    }

    const colour =
      DEFAULT_COLOURS[
        settings.palette.length %
          DEFAULT_COLOURS.length
      ];

    update("palette", [
      ...settings.palette,
      {
        id: crypto.randomUUID(),
        colour,
        weight: 10,
      },
    ]);
  }

  function removeColour(
    index: number
  ) {
    if (
      settings.palette.length <= 1
    ) {
      return;
    }

    update(
      "palette",
      settings.palette.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  const totalWeight =
    settings.palette.reduce(
      (total, item) =>
        total +
        Math.max(0, item.weight),
      0
    );

  return (
    <aside className="controlPanel">
      <div className="panelHeader">
        <div>
          <span className="eyebrow">
            GENERATOR
          </span>

          <h2>Composition</h2>
        </div>

        <div className="seedIndicator">
          {settings.seed}
        </div>
      </div>

      <div className="controlSection">
        <label className="controlLabel">
          Seed
        </label>

        <div className="inputRow">
          <input
            className="numberInput"
            type="number"
            value={settings.seed}
            onChange={(event) =>
              update(
                "seed",
                Number(
                  event.target.value
                )
              )
            }
          />

          <button
            type="button"
            className="smallButton"
            onClick={
              onNewComposition
            }
          >
            Random
          </button>
        </div>
      </div>

      <div className="controlSection">
        <div className="sectionTitleRow">
          <label className="controlLabel">
            Palette
          </label>

          <span className="controlValue">
            {
              settings.palette
                .length
            }{" "}
            colours
          </span>
        </div>

        <div className="paletteList">
          {settings.palette.map(
            (item, index) => {
              const percentage =
                totalWeight > 0
                  ? (item.weight /
                      totalWeight) *
                    100
                  : 0;

              return (
                <div
                  className="paletteWeightItem"
                  key={item.id}
                >
                  <div className="paletteItem">
                    <input
                      className="colourPicker"
                      type="color"
                      value={
                        item.colour
                      }
                      onChange={(
                        event
                      ) =>
                        updatePaletteColour(
                          index,
                          event.target
                            .value
                        )
                      }
                    />

                    <input
                      className="hexInput"
                      value={
                        item.colour
                      }
                      onChange={(
                        event
                      ) =>
                        updatePaletteColour(
                          index,
                          event.target
                            .value
                        )
                      }
                    />

                    <button
                      type="button"
                      className="removeButton"
                      disabled={
                        settings
                          .palette
                          .length <= 1
                      }
                      onClick={() =>
                        removeColour(
                          index
                        )
                      }
                    >
                      ×
                    </button>
                  </div>

                  <div className="weightRow">
                    <span>
                      WEIGHT
                    </span>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={
                        item.weight
                      }
                      onChange={(
                        event
                      ) =>
                        updateWeight(
                          index,
                          Number(
                            event
                              .target
                              .value
                          )
                        )
                      }
                    />

                    <strong>
                      {percentage.toFixed(
                        0
                      )}
                      %
                    </strong>
                  </div>
                </div>
              );
            }
          )}
        </div>

        <button
          type="button"
          className="secondaryButton"
          onClick={addColour}
        >
          + Add colour
        </button>
      </div>

      <div className="controlSection">
        <label className="controlLabel">
          Thickness character
        </label>

        <div className="distributionGrid">
          {DISTRIBUTIONS.map(
            (distribution) => (
              <button
                type="button"
                key={
                  distribution.value
                }
                className={
                  settings.thicknessDistribution ===
                  distribution.value
                    ? "distributionButton active"
                    : "distributionButton"
                }
                onClick={() =>
                  update(
                    "thicknessDistribution",
                    distribution.value
                  )
                }
              >
                {
                  distribution.label
                }
              </button>
            )
          )}
        </div>
      </div>

      <div className="controlSection">
        <div className="sectionTitleRow">
          <label className="controlLabel">
            Minimum streak
          </label>

          <span className="controlValue">
            {
              settings.minLineHeight
            }
            px
          </span>
        </div>

        <input
          className="rangeInput"
          type="range"
          min="1"
          max="200"
          value={
            settings.minLineHeight
          }
          onChange={(event) =>
            update(
              "minLineHeight",
              Math.min(
                Number(
                  event.target.value
                ),
                settings.maxLineHeight
              )
            )
          }
        />
      </div>

      <div className="controlSection">
        <div className="sectionTitleRow">
          <label className="controlLabel">
            Maximum streak
          </label>

          <span className="controlValue">
            {
              settings.maxLineHeight
            }
            px
          </span>
        </div>

        <input
          className="rangeInput"
          type="range"
          min="1"
          max="500"
          value={
            settings.maxLineHeight
          }
          onChange={(event) =>
            update(
              "maxLineHeight",
              Math.max(
                Number(
                  event.target.value
                ),
                settings.minLineHeight
              )
            )
          }
        />
      </div>

      <div className="controlSection">
        <div className="sectionTitleRow">
          <label className="controlLabel">
            Persistence
          </label>

          <span className="controlValue">
            {Math.round(
              settings.persistence *
                100
            )}
            %
          </span>
        </div>

        <input
          className="rangeInput"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={
            settings.persistence
          }
          onChange={(event) =>
            update(
              "persistence",
              Number(
                event.target.value
              )
            )
          }
        />

        <div className="rangeLabels">
          <span>Chaotic</span>
          <span>Clustered</span>
        </div>
      </div>

      <div className="controlSection">
        <div className="sectionTitleRow">
          <label className="controlLabel">
            Colour variation
          </label>

          <span className="controlValue">
            {Math.round(
              settings.colourVariation *
                100
            )}
            %
          </span>
        </div>

        <input
          className="rangeInput"
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={
            settings.colourVariation
          }
          onChange={(event) =>
            update(
              "colourVariation",
              Number(
                event.target.value
              )
            )
          }
        />
      </div>

      <div className="controlSection">
        <label className="controlLabel">
          Canvas
        </label>

        <div className="dimensionGrid">
          <div>
            <span className="miniLabel">
              WIDTH
            </span>

            <input
              className="numberInput"
              type="number"
              value={
                settings.width
              }
              onChange={(event) =>
                update(
                  "width",
                  Math.max(
                    100,
                    Number(
                      event.target
                        .value
                    )
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
              value={
                settings.height
              }
              onChange={(event) =>
                update(
                  "height",
                  Math.max(
                    100,
                    Number(
                      event.target
                        .value
                    )
                  )
                )
              }
            />
          </div>
        </div>

        <div className="presetGrid">
          <button
            onClick={() =>
              onChange({
                ...settings,
                width: 3000,
                height: 3000,
              })
            }
          >
            1:1
          </button>

          <button
            onClick={() =>
              onChange({
                ...settings,
                width: 4500,
                height: 3000,
              })
            }
          >
            3:2
          </button>

          <button
            onClick={() =>
              onChange({
                ...settings,
                width: 4800,
                height: 2700,
              })
            }
          >
            16:9
          </button>

          <button
            onClick={() =>
              onChange({
                ...settings,
                width: 3508,
                height: 2480,
              })
            }
          >
            A4
          </button>
        </div>
      </div>

      <button
        type="button"
        className="generateButton"
        onClick={
          onNewComposition
        }
      >
        Generate new composition
      </button>
    </aside>
  );
}