import { accessLocalStorage } from "./helpers";

export type StorageType = Readonly<{
  seed: string;
  dimension: number;
  stats: Record<string, LevelStats>;
  finishedStory: boolean;
}>;

export type LevelStats = Readonly<{
  seed: string;
  dimension: number;
  deaths: number;
  bestTime: number | null;
}>;

export function accessMainStorage() {
  return accessLocalStorage<StorageType>("darkmaze");
}

export function accessLevelStorage({
  seed,
  dimension,
}: {
  seed: string;
  dimension: number;
}) {
  const storage = accessMainStorage();
  const levelHashKey = `${seed}#${dimension}`;

  function getValue(): LevelStats {
    const { stats } = storage.getValue();
    const current = stats?.[levelHashKey];

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
        [levelHashKey]: fn(getValue()),
      },
    });
  }

  return {
    getValue,
    setValue,
  };
}
