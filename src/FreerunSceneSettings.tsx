import * as React from "react";
import { useNavigate } from "react-router-dom";
import { MIN_DIMENSION, MAX_DIMENSION, DEFAULT_DIMENSION } from "./consts";
import { Button, InputText, InputNumber, MenuScreen } from "./components";
import { generateRandomSeed } from "./helpers";
import { accessMainStorage } from "./storage";

export function FreerunSceneSettings() {
  const navigate = useNavigate();
  const storage = React.useMemo(() => {
    return accessMainStorage();
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
      <h2>dimension & seed</h2>
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
