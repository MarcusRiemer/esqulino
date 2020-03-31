/**
 * I would believe a function like this should be part of the
 * standard library but apparently it isn't.
 */
function isPrimitive(val: any) {
  return (
    val === undefined ||
    val === null ||
    ["string", "number", "boolean", "primitive"].indexOf(typeof val) >= 0
  );
}

/**
 * Assigns every value from `toMerge` in `target` and follows objects
 * if they are encountered. If either side is a primitive  value the assignment
 * takes place without looking into the either of the sides. Arrays are assigned element
 * by element until .
 */
export function deepAssign(target: any, toMerge: any) {
  if (isPrimitive(target) || isPrimitive(toMerge)) {
    return toMerge;
  }
  // We might need to look into arrays
  else if (Array.isArray(target) || Array.isArray(toMerge)) {
    if (Array.isArray(toMerge) && Array.isArray(target)) {
      // Ensure that the target array is as least as long as the array that
      // is merged in
      toMerge.forEach((_, i) => {
        if (i < toMerge.length) {
          // Valid indices need to be merged
          target[i] = deepAssign(target[i], toMerge[i]);
        } else {
          // Invalid indices may be assigned directly
          target[i] = toMerge[i];
        }
      });

      return target;
    }
    // Only one value is an array, this means the right
    // hand side wins
    else {
      return toMerge;
    }
  }
  // From here on we know that we are dealing with objects
  else {
    Object.entries(toMerge).forEach(([name, sourceValue]) => {
      // If the value is not in the target, the assignment can be made directly
      if (name in target) {
        target[name] = deepAssign(target[name], sourceValue);
      } else {
        target[name] = sourceValue;
      }
    });
    return target;
  }
}
