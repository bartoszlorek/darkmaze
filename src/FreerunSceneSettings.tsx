import * as React from "react";
import { useNavigate } from "react-router-dom";
import { MIN_DIMENSION, MAX_DIMENSION, DEFAULT_DIMENSION } from "./consts";
import { accessLocalStorage, generateRandomSeed } from "./helpers";
import { Button, InputText, InputNumber, MenuScreen } from "./components";
import type { StorageType } from "./storage";

export function FreerunSceneSettings() {
  const navigate = useNavigate();
  const storage = React.useMemo(() => {
    return accessLocalStorage<StorageType>("darkmaze");
  }, []);

  const [dimension, setDimension] = React.useState(() => {
    const { dimension = DEFAULT_DIMENSION } = storage.getValue();
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
      <div>dimension & seed</div>
      <InputNumber
        valueType="int"
        value={dimension}
        onChange={handleDimensionInputChange}
        pattern={dimensionInputPattern}
        min={MIN_DIMENSION}
        max={MAX_DIMENSION}
      />
      <InputText value={seed} onChange={handleSeedInputChange} />
      <Button onClick={handleRegenerateButtonClick}>regenerate</Button>
      <Button onClick={handleStartButtonClick}>start the game</Button>
      <Button onClick={handleBackButtonClick}>main menu</Button>
    </MenuScreen>
  );
}

const dimensionInputPattern = (n: number) => `${n}×${n}`;
