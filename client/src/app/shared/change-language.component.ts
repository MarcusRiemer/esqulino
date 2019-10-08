import { Component, Inject, LOCALE_ID } from '@angular/core';
import { Location } from '@angular/common';

import { environment } from './../../environments/environment';

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

export const locales = [
  { token: 'de', name: 'Deutsch', flag: localeToFlag('de') },
  { token: 'en', name: 'English', flag: localeToFlag('en') },
]

@Component({
  selector: 'natural-language-selector',
  templateUrl: './templates/change-language.html'
})
export class ChangeLanguageComponent {
  // The actual locale that is currently in use
  readonly locale = this._localeId;

  readonly locales = locales;

  // The unicode flag for the current locale
  readonly localeFlag = localeToFlag(this.locale);

  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    private readonly _location: Location
  ) {
  }

  /**
   * Changes the natural language of the application.
   *
   * @param langToken The locale to change to, should probably be "de" or "en"
   */
  public changeLanguage(langToken: string) {
    const newUrl = this.currentUrlForLanguage(langToken);
    console.log(`Changing language to "${langToken}", new URL will be "${newUrl}"`)
    document.location.href = newUrl;
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
  public currentUrlForLanguage(langToken: string) {
    const host = langToken == "de"
      ? environment.canonicalHost
      : langToken + "." + environment.canonicalHost;
    return ("//" + host + this.currentPath);
  }
}
