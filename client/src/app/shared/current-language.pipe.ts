import { Pipe, PipeTransform, Inject, LOCALE_ID } from "@angular/core";

import {
  NaturalLanguagesService,
  localeToFlag,
} from "../natural-languages.service";

import { MultiLangString } from "./multilingual-string.description";

/**
 * Inserts a replacement string if the given string is
 * undefined, null or the empty string.
 */
@Pipe({ name: "currentLanguage", pure: true })
export class CurrentLanguagePipe implements PipeTransform {
  constructor(
    private readonly _naturalLanguages: NaturalLanguagesService,
    @Inject(LOCALE_ID)
    private readonly _localeId: string
  ) {}

  transform(value: MultiLangString) {
    const bestLocale = this._naturalLanguages.resolveLocaleId(value);
    let toReturn = this._naturalLanguages.resolveString(value);
    if (bestLocale == this._localeId) {
      return toReturn;
    } else {
      return localeToFlag(bestLocale) + " " + toReturn;
    }
  }
}
