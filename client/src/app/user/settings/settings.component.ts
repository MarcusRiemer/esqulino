import { SideNavService } from './../../shared/side-nav.service';
import { Component } from "@angular/core";

import { NavItem } from '../../shared/nav-interfaces';

export const userSettings: NavItem[] = [
  {
    type: "link",
    text: {
      de: "Account",
      en: "Account",
    },
    route: ["/account"],
    icon: "puzzle-piece",
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
  templateUrl: './templates/settings-index.html'
})
export class UserSettingsComponent {
  constructor(
    private _sideNav: SideNavService
  ) {
    console.log(userSettings)
    this._sideNav.newSideNav(userSettings)
  }
}