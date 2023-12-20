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
    const { min, max } = restProps;
    const value = e.currentTarget.value;

    let valueNum: number = 0;
    if (valueType === "int") {
      if (validator.isInt(value)) {
        valueNum = validator.toInt(value);
      } else {
        return;
      }
    } else if (valueType === "float") {
      if (validator.isFloat(value)) {
        valueNum = validator.toFloat(value);
      } else {
        return;
      }
    }

    if (min !== undefined) {
      valueNum = Math.max(min, valueNum);
    }
    if (max !== undefined) {
      valueNum = Math.min(max, valueNum);
    }

    onChange(valueNum);
  };

  return (
    <input {...restProps} className={styles.input} onChange={handleChange} />
  );
}
