import { Component, Inject, LOCALE_ID } from "@angular/core";
import { of } from "rxjs";

import { Theses } from "./academica-data/theses";

/**
 * Knows everything about theses that have been written.
 */
@Component({
  templateUrl: "templates/academia.html",
})
export class AboutAcademiaComponent {
  readonly theses = of(
    Theses.filter((t) => t.language === this.localeId).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    )
  );

  constructor(@Inject(LOCALE_ID) private readonly localeId: string) {}
}
