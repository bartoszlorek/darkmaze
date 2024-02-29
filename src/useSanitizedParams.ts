import validator from "validator";
import { useParams } from "react-router-dom";
import { MIN_DIMENSION, MAX_DIMENSION, DEFAULT_DIMENSION } from "./consts";
import { clamp } from "./helpers";

type ParamsType = Readonly<{
  seed: string;
  dimension: number;
}>;

export function useSanitizedParams(): ParamsType {
  const { seed = "apple", dimension: rawDimension } = useParams();

  if (rawDimension === undefined || !validator.isInt(rawDimension)) {
    return {
      seed,
      dimension: DEFAULT_DIMENSION,
    };
  }

  return {
    seed,
    dimension: clamp(
      validator.toInt(rawDimension),
      MIN_DIMENSION,
      MAX_DIMENSION
    ),
  };
}
