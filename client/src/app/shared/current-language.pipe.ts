import { Pipe, PipeTransform } from "@angular/core";
import { CurrentLocaleService } from "../current-locale.service";

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
    private readonly _lang: CurrentLocaleService
  ) {}

  transform(value: MultiLangString) {
    const bestLocale = this._naturalLanguages.resolveLocaleId(value);
    let toReturn = this._naturalLanguages.resolveString(value);
    if (bestLocale == this._lang.localeId) {
      return toReturn;
    } else {
      return localeToFlag(bestLocale) + " " + toReturn;
    }
  }
}
