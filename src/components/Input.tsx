import * as React from "react";
import validator from "validator";
import styles from "./Input.module.scss";

type TextPropsType = Readonly<{
  type: "text";
  value: string;
  onChange: (value: string) => void;
}>;

type NumberPropsType = Readonly<{
  type: "number";
  valueType: "float" | "int";
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}>;

export function Input(props: TextPropsType | NumberPropsType) {
  if (props.type === "text") {
    return <InputText {...props} />;
  } else {
    return <InputNumber {...props} />;
  }
}

export function InputText({ onChange, ...restProps }: TextPropsType) {
  return (
    <input
      {...restProps}
      className={styles.input}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}

export function InputNumber({
  valueType,
  onChange,
  ...restProps
}: NumberPropsType) {
  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const value = validateNumber(e.currentTarget.value, valueType);
    if (value !== null) {
      onChange(value);
    }
  };

  const handleBlur = (e: React.FormEvent<HTMLInputElement>) => {
    let value = validateNumber(e.currentTarget.value, valueType);
    if (value === null) {
      return;
    }

    const { min, max } = restProps;
    if (min !== undefined) {
      value = Math.max(min, value);
    }
    if (max !== undefined) {
      value = Math.min(max, value);
    }

    onChange(value);
  };

  return (
    <input
      {...restProps}
      className={styles.input}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}

function validateNumber(value: string, type: "float" | "int"): number | null {
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
