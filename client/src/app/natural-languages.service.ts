import { Injectable, Inject, LOCALE_ID } from "@angular/core";
import { Location, DOCUMENT } from "@angular/common";

import { LinkService } from "./link.service";
import { environment } from "../environments/environment";
import { MultiLangString } from "./shared/multilingual-string.description";

/**
 * @return The unicode string that represents a flag for the given locale
 */
export function localeToFlag(locale: string): string {
  switch (locale) {
    case "de":
      return "🇩🇪";
    case "en":
      return "🇬🇧";
    default:
      return "🏳";
  }
}

/**
 * Available natural languages and their URLs
 */
@Injectable()
export class NaturalLanguagesService {
  constructor(
    private readonly _location: Location,
    private readonly _linkService: LinkService,
    @Inject(DOCUMENT)
    private readonly document: Document,
    @Inject(LOCALE_ID)
    private readonly _localeId: string
  ) {}

  public readonly availableLanguages = environment.availableLanguages;

  updateRootLangAttribute() {
    const htmlElement = this.document.querySelector("html");
    htmlElement.lang = this._localeId;
  }

  updateAlternateUrls() {
    // Ensure that no alternate URL is specified
    this._linkService.removeTags("rel=alternate");

    // Add URLs for all available languages
    environment.availableLanguages.forEach((l) => {
      this._linkService.addTag({
        rel: "alternate",
        hreflang: l.token,
        href: this.urlForLanguage(l.token, "https://"),
      });
    });
  }

  /**
   * The path-portion of the URL that is currently visited by the browser. Also
   * works with the universal rendering server.
   */
  get currentPath() {
    return this._location.path();
  }

  /**
   * @return The current URL for the given language token.
   */
  urlForLanguage(langToken: string, protocol: "//" | "https://" = "//") {
    const host =
      langToken == "de"
        ? environment.canonicalHost
        : langToken + "." + environment.canonicalHost;
    return protocol + host + this.currentPath;
  }

  /**
   * Attempts to find the best matching locale id for the given string.
   */
  resolveLocaleId(value: MultiLangString): string {
    const presentLanguages = Object.keys(value);

    // Match of current language?
    if (presentLanguages.includes(this._localeId) && value[this._localeId] != null) {
      return this._localeId;
    }

    // Try configured languages
    const configLanguages = this.availableLanguages;
    for (let i = 0; i < configLanguages.length; ++i) {
      const currToken = configLanguages[i].token;
      if (presentLanguages.includes(currToken) && value[currToken] != null) {
        return currToken;
      }
    }

    // Select first language that is present
    return presentLanguages[0];
  }

  /**
   * Attempts to find the best matching value of the given string.
   */
  resolveString(value: MultiLangString): string {
    return value[this.resolveLocaleId(value)];
  }
}
