import { Component, Inject, LOCALE_ID } from '@angular/core'
import { Observable, of } from 'rxjs'

import projectProposals from './academica-data/project-proposals'
import theses from './academica-data/theses'


/** Required front end information for a thesis */
interface Thesis {
  id: string
  language: string
  title: string
  subtitle: string
  author: {
    name: string
  }
  institutionLogo: string,
  abstract: string
  degree?: string
  url: string
  date: Date
}

interface ProjectProposal {
  id: string;
  language: string;
  title: string;
  text: string;
  tools: string;
}

/**
 * Knows everything about theses that have been written.
 */
@Component({
  templateUrl: 'templates/academia.html',
})
export class AboutAcademiaComponent {

  readonly theses: Observable<Thesis[]> = of(theses.filter(t => t.language === this.localeId).sort((a, b) => b.date.getTime() - a.date.getTime()));

  readonly projectProposals: Observable<ProjectProposal[]> = of(projectProposals.filter(p => p.language === this.localeId));

  constructor(@Inject(LOCALE_ID) private readonly localeId: string) { }
}
