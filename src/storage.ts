import { accessLocalStorage } from "./helpers";

export type StorageType = Readonly<{
  seed: string;
  dimension: number;
  stats: Record<string, LevelStats>;
}>;

export type LevelStats = Readonly<{
  seed: string;
  dimension: number;
  deaths: number;
  bestTime: number | null;
}>;

export function accessLevelStorage({
  seed,
  dimension,
}: {
  seed: string;
  dimension: number;
}) {
  const storage = accessLocalStorage<StorageType>("darkmaze");
  const levelKey = `${seed}:${dimension}`;

  function getValue(): LevelStats {
    const { stats } = storage.getValue();
    const current = stats?.[levelKey];

    return {
      seed,
      dimension,
      deaths: 0,
      bestTime: null,
      ...current,
    };
  }

  function setValue(fn: (prev: LevelStats) => LevelStats) {
    const { stats: currentStats } = storage.getValue();

    storage.setValue({
      stats: {
        ...currentStats,
        [levelKey]: fn(getValue()),
      },
    });
  }

  return {
    getValue,
    setValue,
  };
}
