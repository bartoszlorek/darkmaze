export function dispatchEvent<T extends string>(type: string, key: T) {
  const event = new KeyboardEvent(type, { key });
  window.dispatchEvent(event);
}

export function dispatchKeyboardEvent<T extends string>(
  type: "keydown" | "keyup" | "keypress",
  key: T
) {
  if (type === "keypress") {
    dispatchEvent("keydown", key);
    setTimeout(() => dispatchEvent("keyup", key), 100);
  } else {
    dispatchEvent(type, key);
  }
}
