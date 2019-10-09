import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Location, DOCUMENT } from '@angular/common';

import { LinkService } from './link.service';
import { environment } from '../environments/environment';

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
    private readonly _localeId: string,
  ) {
  }

  updateRootLangAttribute() {
    const htmlElement = this.document.querySelector("html");
    htmlElement.lang = this._localeId;
  }

  updateAlternateUrls() {
    // Ensure that no alternate URL is specified
    this._linkService.removeTags("rel=alternate")

    // Add URLs for all available languages
    environment.availableLanguages.forEach(l => {
      this._linkService.addTag({
        rel: "alternate",
        hreflang: l.token,
        href: this.urlForLanguage(l.token, "https://")
      });
    });
  }

  /**
   * The path-portion of the URL that is currently visited by the browser. Also
   * works with the universal rendering server.
   */
  get currentPath() {
    return (this._location.path());
  }

  /**
   * @return The current URL for the given language token.
   */
  public urlForLanguage(langToken: string, protocol: "//" | "https://" = "//") {
    const host = langToken == "de"
      ? environment.canonicalHost
      : langToken + "." + environment.canonicalHost;
    return (protocol + host + this.currentPath);
  }
}