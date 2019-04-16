import { Component } from '@angular/core'

import { BrowserService } from '../shared/browser.service';
import { first, tap } from 'rxjs/operators';
import { NavItem } from '../shared/nav-interfaces';

export const indexItems: NavItem[] = [
  {
    type: "link",
    text: {
      de: "Hauptseite",
      en: "Home",
    },
    route: ["/about/"],
    icon: "home",
  },
  {
    type: "link",
    text: {
      de: "Beispielprojekte",
      en: "Example Projects",
    },
    route: ["/about/projects"],
    icon: "cubes"
  },
  {
    type: "divider"
  },
  {
    type: "link",
    text: {
      de: "Forschung",
      en: "Academia",
    },
    route: ["/about/academia"],
    icon: "flask"
  },
  {
    type: "link",
    text: {
      de: "Impressum",
      en: "Imprint",
    },
    route: ["/about/imprint"],
    icon: "file-text-o"
  },
  {
    type: "link",
    text: {
      de: "Datenschutz",
      en: "Privacy",
    },
    route: ["/about/privacy"],
    icon: "user-secret"
  },
  {
    type: "fill"
  },
  {
    type: "header",
    text: {
      de: "Administration",
      en: "Administration",
    },
  },
  {
    type: "link",
    text: {
      de: "Sprachen",
      en: "Languages",
    },
    route: ["/admin"],
    icon: "puzzle-piece"
  },
  {
    type: "external",
    text: {
      de: "Anleitung 🇬🇧",
      en: "Manual 🇬🇧",
    },
    url: "http://manual.blattwerkzeug.de/",
    icon: "book"
  },
];

@Component({
  templateUrl: 'templates/index.html',
})
export class FrontComponent {

  constructor(
    private readonly _browser: BrowserService,
  ) { }

  readonly isMobile$ = this._browser.isMobile$;

  readonly sidebarMode$ = this._browser.sidebarMode$;

  /**
   * All items that need to be shown in the general navigation
   */
  readonly indexItems = indexItems;
}
