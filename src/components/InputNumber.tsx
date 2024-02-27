import * as React from "react";
import validator from "validator";
import styles from "./Input.module.scss";

type ValueType = "float" | "int";

type PropsType = Readonly<{
  valueType: ValueType;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}>;

export function InputNumber({
  valueType,
  value,
  onChange,
  min,
  max,
  step = 1,
}: PropsType) {
  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const nextValue = validateNumber(e.currentTarget.value, valueType);
    if (nextValue !== null) {
      onChange(nextValue);
    }
  };

  const handleBlur = (e: React.FormEvent<HTMLInputElement>) => {
    const nextValue = validateNumber(e.currentTarget.value, valueType);
    if (nextValue !== null) {
      onChange(clamp(nextValue, min, max));
    }
  };

  const handleUpClick = () => {
    const nextValue = clamp(value + step, min, max);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  const handleDownClick = () => {
    const nextValue = clamp(value - step, min, max);
    if (nextValue !== value) {
      onChange(nextValue);
    }
  };

  return (
    <div className={styles.inputNumberWrapper}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        className={styles.inputNumber}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <div className={styles.inputNumberDown} onClick={handleDownClick} />
      <div className={styles.inputNumberUp} onClick={handleUpClick} />
    </div>
  );
}

function validateNumber(value: string, type: ValueType): number | null {
  switch (type) {
    case "float":
      if (validator.isFloat(value)) {
        return validator.toFloat(value);
      } else {
        return null;
      }

    case "int":
      if (validator.isInt(value)) {
        return validator.toInt(value);
      } else {
        return null;
      }
  }
}

function clamp(value: number, min?: number, max?: number) {
  if (min !== undefined) {
    value = Math.max(min, value);
  }
  if (max !== undefined) {
    value = Math.min(max, value);
  }
  return value;
}
