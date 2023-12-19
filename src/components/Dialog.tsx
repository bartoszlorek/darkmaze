import * as React from "react";
import styles from "./Dialog.module.scss";

const PUNCTUATION_LETTERS = ",.?!";
const READING_ONE_LETTER_TIME = 50;
const READING_PUNCTUATION_TIME = 500;
const DISAPPEARING_TIME = 4000;

type PropsType = Readonly<{
  value: string;
}>;

export function Dialog({ value }: PropsType) {
  const [typedValue, setTypedValue] = React.useState<string>("");
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    setHidden(false);
  }, [value]);

  React.useEffect(() => {
    let index = 0;
    let timeoutId: number;

    const typeNextLetter = () => {
      const currentLetter = value[index];
      if (currentLetter === undefined) {
        timeoutId = window.setTimeout(() => setHidden(true), DISAPPEARING_TIME);
        return;
      }
      const readingTime = PUNCTUATION_LETTERS.includes(currentLetter)
        ? READING_PUNCTUATION_TIME
        : READING_ONE_LETTER_TIME;

      setTypedValue(value.slice(0, index + 1));
      timeoutId = window.setTimeout(typeNextLetter, readingTime);
      index += 1;
    };

    typeNextLetter();
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value]);

  if (hidden) {
    return null;
  }

  return (
    <div className={styles.dialog}>
      {typedValue}
      <span className={styles.untypedValue}>
        {value.slice(typedValue.length)}
      </span>
    </div>
  );
}
