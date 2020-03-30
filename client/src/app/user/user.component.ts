import { Component } from "@angular/core";

import { NavItem } from "../shared/nav-interfaces";
import { SideNavService } from "../shared/side-nav.service";

export const userItems: NavItem[] = [
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
export class UserComponent {
  constructor(private _sideNavService: SideNavService) {}

  public userItems: NavItem[] = userItems;

  public navToggle(): void {
    this._sideNavService.toggleSideNav();
  }
}
