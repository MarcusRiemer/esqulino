/**
 * A way to check validity of string unions at runtime.
 * Taken from: https://stackoverflow.com/questions/36836011/
 *
 * const Race = StringUnion(
 *   "orc",
 *   "human",
 *   "night elf",
 *   "undead",
 *  );
 *  type Race = typeof Race.type;
 *
 */
export const StringUnion = <UnionType extends string>(
  ...values: UnionType[]
) => {
  Object.freeze(values);
  const valueSet: Set<string> = new Set(values);

  const guard = (value: string): value is UnionType => {
    return valueSet.has(value);
  };

  const check = (value: string): UnionType => {
    if (!guard(value)) {
      const actual = JSON.stringify(value);
      const expected = values.map((s) => JSON.stringify(s)).join(" | ");
      throw new TypeError(
        `Value '${actual}' is not assignable to type '${expected}'.`
      );
    }
    return value;
  };

  const unionNamespace = { guard, check, values };
  return Object.freeze(
    unionNamespace as typeof unionNamespace & { type: UnionType }
  );
};
