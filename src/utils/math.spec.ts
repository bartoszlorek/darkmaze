import { normalizeAngle, lerp, lerpAngle } from "./math";

describe("normalizeAngle", () => {
  it.each`
    angle   | expected
    ${0}    | ${0}
    ${45}   | ${45}
    ${180}  | ${180}
    ${-180} | ${180}
    ${735}  | ${15}
    ${-320} | ${40}
  `("returns $expected from the $angle angle", ({ angle, expected }) => {
    expect(normalizeAngle(angle)).toBe(expected);
  });
});

describe("lerp", () => {
  it.each`
    a    | b    | bias    | expected
    ${1} | ${2} | ${0.25} | ${1.25}
    ${2} | ${4} | ${0}    | ${2}
    ${2} | ${4} | ${0.33} | ${2.66}
    ${2} | ${4} | ${0.5}  | ${3}
    ${2} | ${4} | ${1}    | ${4}
  `(
    "returns $expected ($bias) value between $a and $b",
    ({ a, b, bias, expected }) => {
      expect(lerp(a, b, bias)).toBe(expected);
    }
  );
});

describe("lerpAngle", () => {
  it.each`
    a     | b      | bias    | expected
    ${0}  | ${90}  | ${0.25} | ${22.5}
    ${0}  | ${90}  | ${0.5}  | ${45}
    ${0}  | ${90}  | ${1}    | ${90}
    ${15} | ${300} | ${0.5}  | ${-22.5}
    ${15} | ${300} | ${0.75} | ${-41.25}
  `(
    "returns $expected ($bias) value between $a and $b angles",
    ({ a, b, bias, expected }) => {
      expect(lerpAngle(a, b, bias)).toBe(expected);
    }
  );
});
