import { Component, ChangeDetectorRef, Inject, LOCALE_ID } from '@angular/core'

import { BrowserService } from '../shared/browser.service';
import { first, tap } from 'rxjs/operators';

/**
 * A object of strings for multiple languages.
 */
export interface MultiLangString {
  de: string;
  en: string;
}

/**
 * A clickable internal link in the side navigation.
 */
export interface NavLink {
  type: "link",
  text: MultiLangString, // The text to display
  route: string[],
  icon?: string
}

/**
 * A clickable external link in the side navigation.
 */
export interface NavLinkExternal {
  type: "external",
  text: MultiLangString, // The text to display
  url: string,
  icon?: string
}

/**
 * A faint horizontal divider
 */
export interface NavDivider {
  type: "divider"
}

/**
 * Fills space and pushes other content as far away as possible
 */
export interface NavFill {
  type: "fill"
}


/**
 * A non-interactive caption text
 */
export interface NavHeader {
  type: "header",
  text: MultiLangString
}

export type NavItem = NavLink | NavDivider | NavFill | NavLinkExternal | NavHeader;

/**
 * @return The unicode string that represents a flag for the given locale
 */
function localeToFlag(locale: string): string {
  switch (locale) {
    case "de": return ("🇩🇪");
    case "en": return ("🇬🇧");
    default: return ("🏳");
  }
}

@Component({
  templateUrl: 'templates/index.html',
})
export class FrontComponent {

  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    private readonly _browser: BrowserService,
  ) { }

  readonly isMobile$ = this._browser.isMobile$;

  readonly sidebarMode$ = this._browser.sidebarMode$;

  // The actual locale that is currently in use
  readonly locale = this._localeId;

  // The unicode flag for the current locale
  readonly localeFlag = localeToFlag(this.locale);

  /**
   * Changes the natural language of the application.
   *
   * @param locale The locale to change to, should probably be "de" or "en"
   */
  public changeLanguage(locale: string) {
    // extract "main" domain: blattwerkzeug.tld
    const upperDomain = location.hostname.split('.').slice(-2).join('.');

    // The production domain already ends in ".de", so there is no reason to repeat that
    const newDomain = locale === "de" ? upperDomain : locale + "." + upperDomain;

    // Replace previous domain with new domain
    const newUrl = location.href.replace(location.hostname, newDomain);

    // And navigate there
    document.location.href = newUrl;
  }

  /**
   * All items that need to be shown in the general navigation
   */
  readonly navItems: NavItem[] = [
    {
      type: "link",
      text: {
        de: "Hauptseite",
        en: "Home",
      },
      route: ["/about/"],
      icon: "home",
    },
    {
      type: "link",
      text: {
        de: "Beispielprojekte",
        en: "Example Projects",
      },
      route: ["/about/projects"],
      icon: "cubes"
    },
    {
      type: "divider"
    },
    {
      type: "link",
      text: {
        de: "Forschung",
        en: "Academia",
      },
      route: ["/about/academia"],
      icon: "flask"
    },
    {
      type: "link",
      text: {
        de: "Impressum",
        en: "Imprint",
      },
      route: ["/about/imprint"],
      icon: "file-text-o"
    },
    {
      type: "link",
      text: {
        de: "Datenschutz",
        en: "Privacy",
      },
      route: ["/about/privacy"],
      icon: "user-secret"
    },
    {
      type: "fill"
    },
    {
      type: "header",
      text: {
        de: "Administration",
        en: "Administration",
      },
    },
    {
      type: "link",
      text: {
        de: "Sprachen",
        en: "Languages",
      },
      route: ["/admin"],
      icon: "puzzle-piece"
    },
    {
      type: "external",
      text: {
        de: "Anleitung 🇬🇧",
        en: "Manual 🇬🇧",
      },
      url: "http://manual.blattwerkzeug.de/",
      icon: "book"
    },
  ];
}
