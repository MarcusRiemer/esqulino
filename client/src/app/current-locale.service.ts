import { Inject, Injectable, LOCALE_ID } from "@angular/core";

export type SupportedLocales = "en" | "de";

/**
 * This service should be preferred over @Inject(LOCALE_ID) as it strips
 * away unwanted region codes.
 */
@Injectable({
  providedIn: "root",
})
export class CurrentLocaleService {
  readonly localeId: SupportedLocales;

  constructor(
    @Inject(LOCALE_ID)
    localeId: string
  ) {
    // Angular may passes in "en-US" if no locale is configured. We hack this
    // away to match our german locale
    if (localeId === "en-US") {
      this.localeId = "de";
    } else {
      this.localeId = localeId.substring(0, 2) as SupportedLocales;
    }
  }
}
