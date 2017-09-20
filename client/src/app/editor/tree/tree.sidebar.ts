import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core'

import { DragService } from './drag.service'
import { LanguageService } from './language.service'

import { QualifiedTypeName, NodeDescription, NodeType } from '../../shared/syntaxtree'

interface AvailableLanguage {
  name: string,
  types: NodeType[]
}

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

  private _availableLanguages: AvailableLanguage[] = [];

  constructor(
    private _languageService: LanguageService,
    private _dragService: DragService
  ) {
  }

  startDrag(evt: DragEvent, type: QualifiedTypeName) {
    this._dragService.dragStart(evt, {
      node: {
        language: type.languageName,
        name: type.typeName
      },
      origin: "sidebar"
    });
  }

  ngOnInit() {
    this.refreshAvailableLanguages();
  }

  /**
   * @return Relevant languages along with their available types
   */
  get availableLanguages() {
    return (this._availableLanguages);
  }

  private refreshAvailableLanguages() {
    this._availableLanguages = Object.entries(this._languageService.availableLanguages).map(([name, lang]) => {
      return ({
        name: name,
        types: lang.availableTypes
      });
    });
  }

}

