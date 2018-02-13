import { Component, Inject } from '@angular/core';

import { QualifiedTypeName, NodeDescription, NodeType, CodeResource } from '../../shared/syntaxtree';
import { BlockLanguage, FixedSidebarBlock } from '../../shared/block';

import { SIDEBAR_MODEL_TOKEN } from '../editor.token';

import { DragService } from '../drag.service';


@Component({
  templateUrl: 'templates/sidebar-fixed-blocks.html',
  selector: "tree-sidebar"
})
export class TreeSidebarFixedBlocksComponent {
  constructor(
    @Inject(SIDEBAR_MODEL_TOKEN) private _codeResource: CodeResource,
    private _dragService: DragService
  ) {
  }

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startDrag(evt: DragEvent, block: FixedSidebarBlock) {
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
    return (this._codeResource.blockLanguage);
  }
}
