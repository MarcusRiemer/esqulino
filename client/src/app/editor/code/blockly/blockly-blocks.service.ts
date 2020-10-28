import { Injectable } from "@angular/core";

import { Observable, combineLatest, BehaviorSubject } from "rxjs";

import { SidebarDataService } from "../../sidebar-data.service";

import { GrammarDocument } from "../../../shared/syntaxtree";
import { BlocklyBlock } from "../../../shared/block/blockly/blockly-types";
import {
  createBlocksFromGrammar,
  createWorkspaceBlocksFromSidebar,
  workspaceBlockToXml,
} from "../../../shared/block/blockly/create-blocks";
import { BlockLanguage } from "../../../shared/block/block-language";

interface LoadableBlocklyDefinition {
  blocks: BlocklyBlock[];
  toolboxXml: Observable<string>;
}

@Injectable({
  providedIn: "root",
})
export class BlocklyBlocksService {
  constructor(private _sidebarData: SidebarDataService) {}

  loadToolbox(blocks: BlocklyBlock[], _b: BlockLanguage): Observable<string> {
    const wrapBlocks = (xmlBlocks: string[]): string => `
      <xml
        xmlns="https://developers.google.com/blockly/xml"
        id="toolbox-simple"
        style="display: none"
      >
        ${xmlBlocks.join("\n")}
      </xml>
    `;

    const coreXml = blocks.map((b) => `<block type="${b.type}"></block>`);
    const toReturn = new BehaviorSubject(wrapBlocks(coreXml));

    const sidebars = this._sidebarData.instantiateSidebars(
      _b.sidebarDesriptions
    );

    // TODO: Figure out the best way to unsubscribe from this subscription
    const allUpdates = combineLatest(
      sidebars.filter((s) => !!s.currentBlocks).map((s) => s.currentBlocks)
    ).subscribe((blockCategories) => {
      console.log("Regenerating dynamic sidebar blocks", blockCategories);

      const blocks = blockCategories.flatMap((c) =>
        createWorkspaceBlocksFromSidebar(c)
      );
      const sidebarBlocks = blocks.map((b) => workspaceBlockToXml(b));
      toReturn.next(wrapBlocks(sidebarBlocks.concat(coreXml)));
    });
    return toReturn;
  }

  loadGrammar(g: GrammarDocument, b: BlockLanguage): LoadableBlocklyDefinition {
    const blocks = createBlocksFromGrammar(g);

    return {
      blocks,
      toolboxXml: this.loadToolbox(blocks, b),
    };
  }
}
