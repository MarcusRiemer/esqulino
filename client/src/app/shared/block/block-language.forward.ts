/**
 * Hacky forward declaration because there is a parent <->
 * child relationship between BlockLanguages and their
 * sidebar definitions.
 */
export interface BlockLanguage {
  readonly hasMultipleSidebars: boolean;
}
