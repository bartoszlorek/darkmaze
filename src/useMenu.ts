import * as React from "react";
import { Keyboard } from "./core";

type MenuKeys = "Escape";

export function useMenu(): [boolean, () => void] {
  const [open, setOpen] = React.useState(false);
  const close = React.useCallback(() => setOpen(false), []);

  React.useEffect(() => {
    const keyboard = new Keyboard<MenuKeys>();

    keyboard.on(["Escape"], (pressed) => {
      if (pressed) setOpen((bool) => !bool);
    });

    return () => {
      keyboard.destroy();
    };
  }, []);

  return [open, close];
}
