/**
 * String -> String
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

