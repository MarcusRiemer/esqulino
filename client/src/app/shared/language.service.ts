import { Injectable } from "@angular/core";

import { AvailableLanguages, Language } from "./syntaxtree";

/**
 * Groups together information about languages that are available
 * as part of the compiled client.
 */
@Injectable()
export class LanguageService {
  /**
   * @return All languages that may be used to compile and validate code.
   */
  get availableLanguages(): ReadonlyArray<Language> {
    return Object.values(AvailableLanguages);
  }

  /**
   * @return IDs of all available language models.
   */
  get availableLanguageIds() {
    return this.availableLanguages.map((m) => m.programmingLanguageId);
  }

  /**
   * @param id The id of the language
   * @return The specific Language that was asked for.
   */
  getLanguage(id: string) {
    const toReturn = this.availableLanguages.find(
      (l) => l.programmingLanguageId === id
    );
    if (!toReturn) {
      const available = this.availableLanguageIds.join(", ");
      throw new Error(
        `Language with ID "${id}" is unknown to the LanguageService, known languages are: ${available}`
      );
    }

    return toReturn;
  }
}
