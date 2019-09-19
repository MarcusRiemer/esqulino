import { SideNavService } from './../shared/side-nav.service';
import { Component, OnInit } from '@angular/core'

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
      de: "Entwicklung",
      en: "Development",
    },
    route: ["/about/development"],
    icon: "code-fork"
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
    requireRoles: ["admin"],
  },
  {
    type: "link",
    text: {
      de: "Administration",
      en: "Administration",
    },
    route: ["/admin"],
    icon: "user-secret",
    requireRoles: ["admin"],
  },
  {
    type: "external",
    text: {
      de: "Anleitung 🇬🇧",
      en: "Manual 🇬🇧",
    },
    url: "http://manual.blattwerkzeug.de/",
    icon: "book",
  },
];

/**
 * The "frame" around the about pages, contains stuff like the navigation
 * but not the actual content.
 */
@Component({
  templateUrl: 'templates/index.html',
})
export class FrontComponent implements OnInit {
  constructor(
    private _sideNavService: SideNavService
  ) { }
  /**
   * All items that need to be shown in the general navigation
   */
  readonly indexItems = indexItems;

  public ngOnInit(): void {
    this._sideNavService.newSideNav(this.indexItems);
  }
  
  // Toggles the shared side-nav
  public navToggle(): void {
    this._sideNavService.toggleSideNav();
  }
}
