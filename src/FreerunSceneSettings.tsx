import * as React from "react";
import { useNavigate } from "react-router-dom";
import { MIN_DIMENSION, MAX_DIMENSION } from "./consts";
import { accessLocalStorage, generateRandomSeed } from "./helpers";
import { Button, Input, MenuScreen } from "./components";

type StorageType = Readonly<{
  seed: string;
  dimension: number;
}>;

export function FreerunSceneSettings() {
  const navigate = useNavigate();
  const storage = React.useMemo(() => {
    return accessLocalStorage<StorageType>("darkmaze");
  }, []);

  const [dimension, setDimension] = React.useState(() => {
    const { dimension = MIN_DIMENSION } = storage.getValue();
    storage.setValue({ dimension });
    return dimension;
  });

  const [seed, setSeed] = React.useState(() => {
    const { seed = generateRandomSeed() } = storage.getValue();
    storage.setValue({ seed });
    return seed;
  });

  const handleDimensionInputChange = (dimension: number) => {
    setDimension(dimension);
    storage.setValue({ dimension });
  };

  const handleSeedInputChange = (seed: string) => {
    setSeed(seed);
    storage.setValue({ seed });
  };

  const handleRegenerateButtonClick = () => {
    const seed = generateRandomSeed();
    setSeed(seed);
    storage.setValue({ seed });
  };

  const handleStartButtonClick = () => {
    navigate(`/freerun/${seed}/${dimension}`);
  };

  const handleBackButtonClick = () => {
    navigate("/");
  };

  return (
    <MenuScreen>
      <Input
        type="number"
        valueType="int"
        value={dimension}
        onChange={handleDimensionInputChange}
        min={MIN_DIMENSION}
        max={MAX_DIMENSION}
      />
      <Input type="text" value={seed} onChange={handleSeedInputChange} />
      <Button onClick={handleRegenerateButtonClick}>regenerate</Button>
      <Button onClick={handleStartButtonClick}>start the game</Button>
      <Button onClick={handleBackButtonClick}>main menu</Button>
    </MenuScreen>
  );
}
