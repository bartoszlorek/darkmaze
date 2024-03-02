import * as React from "react";

export type MenuState = Readonly<{
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}>;

export function useMenu(): MenuState {
  const [isOpen, setIsOpen] = React.useState(false);

  const state = React.useMemo(
    () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      toggle: () => setIsOpen((prev) => !prev),
      isOpen,
    }),
    [isOpen]
  );

  return state;
}
