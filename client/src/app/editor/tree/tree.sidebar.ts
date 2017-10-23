import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core'

import { QualifiedTypeName, NodeDescription, NodeType } from '../../shared/syntaxtree'
import { LanguageModel } from '../../shared/block'

import { DragService } from './drag.service'
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
export class TreeSidebarComponent {
  /**
   * This ID is used to register this sidebar with the sidebar loader
   */
  public static get SIDEBAR_IDENTIFIER() { return "tree" };

  constructor(
    private _languageService: LanguageService,
    private _dragService: DragService
  ) {
  }

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startDrag(evt: DragEvent, desc: NodeDescription) {
    try {
      console.log("Dragging", desc);
      this._dragService.dragStart(evt, {
        draggedDescription: desc,
        origin: "sidebar"
      });
    } catch (e) {
      alert(e);
    }
  }

  /**
   * @return Relevant languages along with their available types
   */
  get availableLanguages() {
    return (this._languageService.availableLanguageModels);
  }
}

