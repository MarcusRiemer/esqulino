import { Component, Inject } from "@angular/core";

import { CodeResource } from "../../shared/syntaxtree";
import { FixedSidebarBlock } from "../../shared/block";

import { SIDEBAR_MODEL_TOKEN } from "../editor.token";

import { DragService } from "../drag.service";
import { map } from "rxjs/operators";

@Component({
  templateUrl: "templates/sidebar-fixed-blocks.html",
  selector: "code-sidebar-fixed-blocks",
})
export class CodeSidebarFixedBlocksComponent {
  constructor(
    @Inject(SIDEBAR_MODEL_TOKEN) private _codeResource: CodeResource,
    private _dragService: DragService
  ) {}

  /**
   * The user has decided to start dragging something from the sidebar.
   */
  startDrag(evt: DragEvent, block: FixedSidebarBlock) {
    try {
      const tailoredNode = block.tailoredBlockDescription(
        this._codeResource.syntaxTreePeek
      );
      this._dragService.dragStart(evt, tailoredNode, {
        sidebarBlockDescription: block,
      });
    } catch (e) {
      alert(e);
    }
  }

  readonly currentBlockLanguage$ = this._codeResource.blockLanguage;

  readonly fixedBlockSidebars$ = this.currentBlockLanguage$.pipe(
    map((b) =>
      b.sidebars.filter((s) => s.portalComponentTypeId === "fixedBlocks")
    )
  );
}
