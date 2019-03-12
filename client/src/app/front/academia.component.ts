import { Component, Inject, LOCALE_ID } from '@angular/core'
import { Observable, of } from 'rxjs'

interface Thesis {
  id: string
  title: string
  subtitle: string
  author: {
    name: string
  }
  institutionLogo,
  abstract: string
  degree: string
  url: string
  date: Date
}

/**
 * For the moment there is no reason to grab the thesis information from
 * any dynamic third party service or server.
 */
const THESIS_BASE_URL = "http://files.blattwerkzeug.de/theses";

/**
 * Knows everything about theses that have been written.
 */
@Component({
  templateUrl: 'templates/academia.html',
})
export class AboutAcademiaComponent {

  private _theses: Thesis[] = require(`./theses/theses.${this.localeId}.json`).map(_thesis => {
    _thesis['date'] = new Date(_thesis['date']);
    _thesis['url'] = `${THESIS_BASE_URL}/${_thesis['url']}`
    return <Thesis>_thesis;
  })

  constructor(@Inject(LOCALE_ID) protected localeId: string) { }

  public get theses(): Observable<Thesis[]> {
    return (of(this._theses));
  }
}
