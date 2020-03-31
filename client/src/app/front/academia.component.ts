import { Component, Inject, LOCALE_ID } from "@angular/core";
import { Observable, of } from "rxjs";

import theses from "./academica-data/theses";

/** Required front end information for a thesis */
interface Thesis {
  id: string;
  language: string;
  title: string;
  subtitle: string;
  author: {
    name: string;
  };
  institutionLogo: string;
  abstract: string;
  degree?: string;
  url: string;
  date: Date;
}

/**
 * Knows everything about theses that have been written.
 */
@Component({
  templateUrl: "templates/academia.html",
})
export class AboutAcademiaComponent {
  readonly theses: Observable<Thesis[]> = of(
    theses
      .filter((t) => t.language === this.localeId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
  );

  constructor(@Inject(LOCALE_ID) private readonly localeId: string) {}
}
