import * as React from "react";
import { Keyboard } from "./engine";

type MenuKeys = "Escape";

export function useMenu() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const keyboard = new Keyboard<MenuKeys>();

    keyboard.on(["Escape"], (pressed) => {
      if (pressed) setOpen((bool) => !bool);
    });

    return () => {
      keyboard.destroy();
    };
  }, []);

  return open;
}
