import { Injectable } from "@angular/core";

import { GrammarDocument, NodeDescription } from "../../../shared/syntaxtree";

import { BlocklyBlock } from "../../../shared/block/blockly/blockly-types";
import { createBlocksFromGrammar } from "../../../shared/block/blockly/create-blocks";

@Injectable()
export class BlocklyBlocksService {
  loadToolbox(blocks: BlocklyBlock[]): string {
    const blocksXml = blocks.map((b) => `<block type="${b.type}"></block>`);
    return `
      <xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-simple" style="display: none">
        ${blocksXml.join()}
      </xml>`;
  }

  loadGrammar(g: GrammarDocument): { blocks: BlocklyBlock[]; toolbox: string } {
    const blocks = createBlocksFromGrammar(g);

    return {
      blocks,
      toolbox: this.loadToolbox(blocks),
    };
  }
}
