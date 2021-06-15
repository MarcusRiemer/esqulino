import { Component, OnInit } from "@angular/core";

import { NavItem } from "../shared/nav-interfaces";
import { SideNavService } from "../shared/side-nav.service";

export const userSettings: NavItem[] = [
  {
    type: "link",
    text: {
      de: "Account",
      en: "Account",
    },
    route: ["/user/settings"],
    icon: "user",
  },
  {
    type: "link",
    text: {
      de: "Projekte",
      en: "Projects",
    },
    route: ["/user/projects"],
    icon: "code-fork",
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
  templateUrl: "./templates/user-index.html",
})
export class UserComponent implements OnInit {
  constructor(private _sideNavService: SideNavService) {}

  ngOnInit(): void {
    this._sideNavService.newSideNav(userSettings);
  }

  public navToggle(): void {
    this._sideNavService.toggleSideNav();
  }
}
