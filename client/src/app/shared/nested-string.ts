/**
 * A possibly infinitely nested list of strings. Practically this should have far
 * fewer nested types as "infinity" and is used to represent the indentation of
 * strings.
 */
export interface NestedString extends Array<NestedString | string> {

}

/**
 * "Flattens" the given arbitrarily nested strings to a single string. The resulting
 * string is indented according to the given indentation character which is repeated
 * according to the current nesting level.
 *
 * @param sep The separation character to use after each list
 * @param indent The indentation character to use in front of each item
 * @param n The nested string
 */
export function recursiveJoin(sep: string, indent: string, n: NestedString): string {
  const impl = (sep: string, n: NestedString | string, depth: number): string => {
    if (typeof n === 'string') {
      return (indent.repeat(depth) + n);
    } else {
      return (
        n.map(v => impl(sep, v, depth + 1))
          .join(sep)
      );
    }
  };

  // Run the recursive implementation
  const resultString = impl(sep, n, -1);

  // Get rid of whitespace only lines
  return (resultString);
}
