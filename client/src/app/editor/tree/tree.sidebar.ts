import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core'

import { LanguageService } from './language.service'

/**
 * The sidebar hosts elements that can be dragged onto the currently active
 * query. Additionally it sometimes offers a "trashcan" where items can be
 * dropped if they are meant to be deleted.
 */
@Component({
  templateUrl: 'templates/sidebar.html',
  selector: "tree-sidebar"
})
export class TreeSidebarComponent implements OnInit {
  /**
   * This ID is used to register this sidebar with the sidebar loader
   */
  public static get SIDEBAR_IDENTIFIER() { return "tree" };

  constructor(private _languageService: LanguageService) {
  }

  ngOnInit() {

  }

  /**
   * @return Relevant languages along with their available types
   */
  get availableLanguages() {
    return (Object.entries(this._languageService.availableLanguages).map(([name, lang]) => {
      return ({
        name: name,
        types: lang.availableTypes
      });
    }));
  }

}

