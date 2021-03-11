import { Component } from "@angular/core";

import { environment } from "./../../environments/environment";
import {
  NaturalLanguagesService,
  localeToFlag,
} from "../natural-languages.service";
import { CurrentLocaleService } from "../current-locale.service";

export const locales = environment.availableLanguages.map((l) => {
  return Object.assign({}, l, { flag: localeToFlag(l.token) });
});

@Component({
  selector: "natural-language-selector",
  templateUrl: "./templates/change-language.html",
})
export class ChangeLanguageComponent {
  readonly locales = locales;

  constructor(
    private readonly _lang: CurrentLocaleService,
    private readonly _naturalLanguages: NaturalLanguagesService
  ) {}

  // The actual locale that is currently in use
  readonly locale = this._lang.localeId;

  // The unicode flag for the current locale
  readonly localeFlag = localeToFlag(this.locale);

  /**
   * @return The current URL for the given language token.
   */
  public urlForLanguage(langToken: string) {
    return this._naturalLanguages.urlForLanguage(langToken);
  }
}
