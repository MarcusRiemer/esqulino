/**
 * I would believe a function like this should be part of the 
 * standard library but apparently it isn't.
 */
function isPrimitive(val: any) {
  return (val === undefined
    || val === null
    || ["string", "number", "boolean", "primitive"].indexOf(typeof (val)) >= 0);
}

/**
 * Assigns every value from `toMerge` in `target` and follows objects
 * if they are encountered. If either side is an array or a primitive 
 * value the assignment takes place without looking into the either
 * of the sides.
 */
export function deepAssign(target: any, toMerge: any) {
  if (target === undefined) {
    throw new Error(`Can't assign: "target" is undefined`);
  } else if (toMerge === undefined) {
    throw new Error(`Can't assign: "toMerge" is undefined`);
  }

  Object.entries(toMerge).forEach(([name, value]) => {
    const targetHasKey = name in target;
    const isPrimitiveValue = isPrimitive(value);
    const isPrimitiveTarget = isPrimitive(target[name]);

    if (!targetHasKey
      || isPrimitiveTarget || isPrimitiveValue
      || Array.isArray(value) || Array.isArray(target[name])) {
      target[name] = value;
    } else {
      deepAssign(target[name], value);
    }
  });

  return (target);
}
