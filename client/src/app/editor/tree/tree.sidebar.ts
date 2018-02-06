import { Component, Input, OnInit, OnDestroy, Inject } from '@angular/core'

import { LanguageService } from '../../shared/language.service';
import { QualifiedTypeName, NodeDescription, NodeType, CodeResource } from '../../shared/syntaxtree'
import { BlockLanguage, SidebarBlock } from '../../shared/block'

import { SIDEBAR_MODEL_TOKEN } from '../editor.token'

import { DragService } from '../drag.service';

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
    @Inject(SIDEBAR_MODEL_TOKEN) private _codeResource: CodeResource,
    private _languageService: LanguageService,
    private _dragService: DragService
  ) {
  }

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startDrag(evt: DragEvent, block: SidebarBlock) {
    try {
      this._dragService.dragStart(evt, block.defaultNode, {
        sidebarBlockDescription: block
      });
    } catch (e) {
      alert(e);
    }
  }

  /**
   * @return Relevant languages along with their available types
   */
  get currentLanguage() {
    return (this._codeResource.languageModel);
  }
}

