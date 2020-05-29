import { Pipe, PipeTransform } from "@angular/core";

import { NaturalLanguagesService } from "../natural-languages.service";

import { MultiLangString } from "./multilingual-string.description";

/**
 * Inserts a replacement string if the given string is
 * undefined, null or the empty string.
 */
@Pipe({ name: "currentLanguage", pure: true })
export class CurrentLanguagePipe implements PipeTransform {
  constructor(private readonly _naturalLanguages: NaturalLanguagesService) {}

  transform(value: MultiLangString) {
    return this._naturalLanguages.resolveString(value);
  }
}
