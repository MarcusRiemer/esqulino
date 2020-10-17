import { Component, Inject } from "@angular/core";

import { CodeResource } from "../../shared/syntaxtree";

import { SIDEBAR_MODEL_TOKEN } from "../editor.token";

import { map } from "rxjs/operators";
import {
  FixedBlocksSidebarDescription,
  FixedBlocksSidebar,
} from "src/app/shared/block";

@Component({
  templateUrl: "templates/sidebar-fixed-blocks.html",
  selector: "code-sidebar-fixed-blocks",
})
export class CodeSidebarFixedBlocksComponent {
  constructor(
    @Inject(SIDEBAR_MODEL_TOKEN)
    public readonly codeResource: CodeResource
  ) {}

  readonly currentBlockLanguage$ = this.codeResource.blockLanguage;

  readonly fixedBlockSidebars$ = this.currentBlockLanguage$.pipe(
    map((b) =>
      b.sidebarDesriptions
        .filter(
          (s): s is FixedBlocksSidebarDescription => s.type === "fixedBlocks"
        )
        .map((s) => new FixedBlocksSidebar(s))
    )
  );
}
