
import { Component } from '@angular/core'

import { NavItem } from '../shared/nav-interfaces';

export const adminItems: NavItem[] = [
  {
    type: "link",
    text: {
      de: "Benutzer",
      en: "User",
    },
    route: ["/admin"],
    icon: "puzzle-piece",
  },
  {
    type: "link",
    text: {
      de: "Grammatiken",
      en: "Grammar",
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
    type: "fill"
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

/**
 * Hosts general menus and layout.
 */
@Component({
  templateUrl: 'templates/admin.html'
})
export class AdminComponent {
  /**
   * All items that need to be shown in the general navigation
   */
  readonly adminItems = adminItems;

}
