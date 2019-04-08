
import { Component } from '@angular/core'
import { BrowserService } from '../shared/browser.service';
import { NavItem } from '../shared/nav-interfaces';

/**
 * Hosts general menus and layout.
 */
@Component({
  templateUrl: 'templates/admin.html'
})
export class AdminComponent {

  constructor(
    private readonly _browser: BrowserService,
  ) { }

  readonly isMobile$ = this._browser.isMobile$;

  readonly sidebarMode$ = this._browser.sidebarMode$;

  /**
   * All items that need to be shown in the general navigation
   */
  readonly adminItems: NavItem[] = [
    {
      type: "link",
      text: {
        de: "Administration",
        en: "Administration",
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
      type: "external",
      text: {
        de: "Anleitung 🇬🇧",
        en: "Manual 🇬🇧",
      },
      url: "http://manual.blattwerkzeug.de/",
      icon: "book"
    },
  ];

}
