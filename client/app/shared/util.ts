/**
 * Determines whether the given identifier can be used as a name
 * in esqulino.
 *
 * @param name The name to test.
 *
 * @return True, if the given name could be used.
 */
export function isValidResourceName(name : string) : boolean {
    return (name && /^[a-zA-Z]+(\w|-)*$/.test(name));
}

/**
 * Ensures the given name can be used as an identifier in esqulino.
 *
 * @param name The name to test.
 */
export function assertValidResourceName(name : string) : void {
    if (!isValidResourceName(name)) {
        throw new Error(`${name} is not a valid resource name`);
    }
}

