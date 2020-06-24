import { KnownLangString } from "./multilingual-string.description";

/**
 * A clickable internal link in the side navigation.
 */
export interface NavLink {
  type: "link";
  text: KnownLangString; // The text to display
  route: string[];
  requireRoles?: string[];
  icon?: string;
  highlightExact?: boolean;
}

/**
 * A clickable external link in the side navigation.
 */
export interface NavLinkExternal {
  type: "external";
  text: KnownLangString; // The text to display
  url: string;
  icon?: string;
}

/**
 * A faint horizontal divider
 */
export interface NavDivider {
  type: "divider";
}

/**
 * Fills space and pushes other content as far away as possible
 */
export interface NavFill {
  type: "fill";
}

/**
 * A non-interactive caption text
 */
export interface NavHeader {
  type: "header";
  text: KnownLangString;
  requireRoles?: string[];
}

export type NavItem =
  | NavLink
  | NavDivider
  | NavFill
  | NavLinkExternal
  | NavHeader;
