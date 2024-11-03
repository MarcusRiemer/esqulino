import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";

import { CodeResource } from "../../shared/syntaxtree";
import { FixedSidebarBlock, FixedBlocksSidebar } from "../../shared/block";

import { DragService } from "../drag.service";
import { Observable, of, pipe } from "rxjs";

@Component({
  templateUrl: "templates/draggable-block-list.html",
  selector: "draggable-block-list",
})
export class DraggableBlockListComponent implements OnChanges {
  @Input()
  blockSidebar: FixedBlocksSidebar;

  @Input()
  codeResource: CodeResource;
  constructor(private _dragService: DragService) {}

  shownBlocks$: Observable<[]> = of([]);

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
  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.shownBlocks$;
  }
}
