import { NodeLocation } from './syntaxtree';

/**
 * Any mapping from String -> String
 */
export type KeyValuePairs = { [paramKey: string]: string };

/**
 * Determines whether the given identifier can be used as a name
 * in esqulino.
 *
 * @param name The name to test.
 *
 * @return True, if the given name could be used.
 */
export function isValidResourceName(name: string): boolean {
  return (name && /^[a-zA-Z]+(\w|-)*$/.test(name));
}

/**
 * Ensures the given name can be used as an identifier in esqulino.
 *
 * @param name The name to test.
 */
export function assertValidResourceName(name: string): void {
  if (!isValidResourceName(name)) {
    throw new Error(`${name} is not a valid resource name`);
  }
}

/**
 * Determines whether the given identifier can be used as a
 * resource ID in esqulino.
 *
 * @param id The id to test.
 *
 * @return True, if the given id could be used.
 */
export function isValidResourceId(id: string): boolean {
  return (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));
}

/**
 * Properly encodes KeyValue-Pairs to their URL representation.
 * { "a key" : "a value" } => "a%20key=a%20value"
 */
export function encodeUriParameters(params: KeyValuePairs) {
  // Encode each key and parameter, put a '=' in between and
  // join all of those together with '&'. This should then be
  // a valid URL.
  const toReturn = Object.entries(params)
    .map(kv => [encodeURIComponent(kv[0]), encodeURIComponent(kv[1])])
    .map(kv => `${kv[0]}=${kv[1]}`)
    .join("&")

  return (toReturn);
}

/**
 * Returns a function that may be used as input for `Array.prototype.sort`
 * on objects.
 *
 * Code is adapted from Ege Özcan on StackOverflow: https://stackoverflow.com/a/4760279/431715
 */
export function fieldCompare<T>(property: keyof T, reverse = false) {
  const sortOrder = reverse ? -1 : 1;
  return function(a: T, b: T) {
    var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
    return result * sortOrder;
  }
}

/**
 * Recursively compares arrays nested arrays. Code is adapted from
 * Tomáš Zato on StackOverflow: https://stackoverflow.com/a/14853974/431715
 */
export function arrayEqual(lhs: any[], rhs: any[]) {
  if (!(lhs instanceof Array) || !(rhs instanceof Array)) {
    return (false);
  }

  // compare lengths - can save a lot of time
  if (lhs.length != rhs.length) {
    return (false);
  }

  for (var i = 0, l = lhs.length; i < l; i++) {
    // Check if we have nested arrays
    if (lhs[i] instanceof Array && rhs[i] instanceof Array) {
      // recurse into the nested arrays
      if (!arrayEqual(lhs[i], rhs[i]))
        return (false);
    }
    // Warning - two different object instances will never be equal: {x:20} !== {x:20}
    // In this case this is desireable, but there may be situations where that is not
    // the case.
    else if (lhs[i] !== rhs[i]) {
      return (false);
    }
  }

  // No counter proof found, these arrays must be equal
  return (true);
}

/**
 * Checks whether the prefix in question is actually a prefix of the full path.
 */
export function locationIsOnPath(prefix: NodeLocation, full: NodeLocation): boolean {
  if (full.length >= prefix.length) {
    return (prefix.every((step, i) => arrayEqual(step, full[i])));
  } else {
    return (false);
  }
}

/**
 * Returns a deep copy of the object with the named key removed.
 */
export function objectOmit<K extends keyof T, T>(omit: K, obj: T): Omit<T, K> {
  const deepCopy = JSON.parse(JSON.stringify(obj));
  delete deepCopy[omit];

  return (deepCopy);
}