import { Component, Input } from "@angular/core";

import { CodeResource } from "../../shared/syntaxtree";
import { FixedSidebarBlock, FixedBlocksSidebar } from "../../shared/block";

import { DragService } from "../drag.service";

@Component({
  templateUrl: "templates/draggable-block-list.html",
  selector: "draggable-block-list",
})
export class DraggableBlockListComponent {
  @Input()
  blockSidebar: FixedBlocksSidebar;

  @Input()
  codeResource: CodeResource;

  constructor(private _dragService: DragService) {}

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startDrag(evt: DragEvent, block: FixedSidebarBlock) {
    try {
      const tailoredNode = block.tailoredBlockDescription(
        this.codeResource.syntaxTreePeek
      );
      this._dragService.dragStart(evt, tailoredNode, {
        sidebarBlockDescription: block,
      });
    } catch (e) {
      alert(e);
    }
  }
}
