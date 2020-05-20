import { Component, OnInit } from "@angular/core";

import { SideNavService } from "../../shared/side-nav.service";
import { NavItem } from "../../shared/nav-interfaces";

export const userSettings: NavItem[] = [
  {
    type: "link",
    text: {
      de: "Account",
      en: "Account",
    },
    route: ["/user/settings/account"],
    icon: "user",
  },
  {
    type: "fill",
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

@Component({
  templateUrl: "./components/templates/settings-index.html",
})
export class UserSettingsComponent implements OnInit {
  constructor(private _sideNav: SideNavService) {}

  /**
   * Reloads the side-nav
   */
  ngOnInit(): void {
    this._sideNav.newSideNav(userSettings);
  }
}
