import { Component } from "@angular/core";

import { NavItem } from '../shared/nav-interfaces';

export const userItems: NavItem[] = [
  {
    type: "link",
    text: {
      de: "Profil",
      en: "Profil",
    },
    route: ["/user"],
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
  templateUrl: "./templates/user-index.html"
})
export class UserComponent {

  public readonly userItems = userItems;
}