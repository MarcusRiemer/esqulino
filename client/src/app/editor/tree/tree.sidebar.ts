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

  /**
   * @return The user has decided to start dragging something from the sidebar.
   */
  startDrag(evt: DragEvent, type: QualifiedTypeName) {
    this._dragService.dragStart(evt, {
      draggedDescription: this.constructDefaultNode(type),
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

  /**
   * Rebuilds the cache with available languages and their types.
   */
  private refreshAvailableLanguages() {
    this._availableLanguages = Object.entries(this._languageService.availableLanguages).map(([name, lang]) => {
      return ({
        name: name,
        types: lang.availableTypes
      });
    });
  }

  /**
   * Adds properties and child groups to a child that are probably needed.
   */
  private constructDefaultNode(typeName: QualifiedTypeName) {
    // Construct the barebones description
    const toReturn: NodeDescription = {
      language: typeName.languageName,
      name: typeName.typeName
    };

    // Get hold of the type that is about to be instanciated.
    const lang = this._languageService.getLanguageByName(typeName.languageName);
    const t = lang.getType(typeName);

    // Are there any children categories that could be added preemptively?
    const reqCat = t.requiredChildrenCategoryNames;
    if (reqCat.length > 0) {
      toReturn.children = {};
      reqCat.forEach(c => {
        toReturn.children[c] = [];
      });
    }

    // Are there any properties that could be added preemptively?

    return (toReturn);
  }
}

