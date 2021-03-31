import { Component } from "@angular/core";
import { of } from "rxjs";

import { CurrentLocaleService } from "../current-locale.service";

import { Theses } from "./academica-data/theses";

/**
 * Knows everything about theses that have been written.
 */
@Component({
  templateUrl: "templates/academia.html",
})
export class AboutAcademiaComponent {
  constructor(private readonly _lang: CurrentLocaleService) {}

  readonly theses = of(
    Theses.filter((t) => t.language === this._lang.localeId).sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    )
  );
}
