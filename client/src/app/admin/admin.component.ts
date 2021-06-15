import { Component, OnInit } from "@angular/core";

import { NavItem } from "../shared/nav-interfaces";
import { SideNavService } from "../shared/side-nav.service";

export const adminItems: NavItem[] = [
  {
    type: "link",
    text: {
      de: "Benutzer",
      en: "Users",
    },
    route: ["/admin/user"],
    icon: "users",
  },
  {
    type: "link",
    text: {
      de: "Projekte",
      en: "Projects",
    },
    route: ["/admin/project"],
    icon: "code-fork",
  },
  {
    type: "link",
    text: {
      de: "Grammatiken",
      en: "Grammars",
    },
    route: ["/admin/grammar"],
    icon: "puzzle-piece",
  },
  {
    type: "link",
    text: {
      de: "Blocksprachen",
      en: "Block languages",
    },
    route: ["/admin/block-language"],
    icon: "puzzle-piece",
  },
  {
    type: "link",
    text: {
      de: "Neuigkeiten",
      en: "News",
    },
    route: ["/admin/news"],
    icon: "newspaper-o",
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

/**
 * Hosts general menus and layout.
 */
@Component({
  templateUrl: "templates/admin.html",
})
export class AdminComponent implements OnInit {
  constructor(private _sideNavService: SideNavService) {}

  ngOnInit(): void {
    this._sideNavService.newSideNav(adminItems);
  }

  // Toggles the shared side-nav
  public navToggle(): void {
    this._sideNavService.toggleSideNav();
  }
}
