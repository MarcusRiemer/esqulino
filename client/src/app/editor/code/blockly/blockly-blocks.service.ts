import { Injectable } from "@angular/core";

import { Observable, of } from "rxjs";

import { GrammarDocument } from "../../../shared/syntaxtree";
import { BlocklyBlock } from "../../../shared/block/blockly/blockly-types";
import { createBlocksFromGrammar } from "../../../shared/block/blockly/create-blocks";
import { BlockLanguage } from "../../../shared/block/block-language.forward";

interface LoadableBlocklyDefinition {
  blocks: BlocklyBlock[];
  toolboxXml: Observable<string>;
}

@Injectable()
export class BlocklyBlocksService {
  constructor() {}

  loadToolbox(blocks: BlocklyBlock[], b: BlockLanguage): Observable<string> {
    const blocksXml = blocks.map((b) => `<block type="${b.type}"></block>`);

    return of(`
      <xml
        xmlns="https://developers.google.com/blockly/xml"
        id="toolbox-simple"
        style="display: none"
      >
        ${blocksXml.join()}
      </xml>
    `);
  }

  loadGrammar(g: GrammarDocument, b: BlockLanguage): LoadableBlocklyDefinition {
    const blocks = createBlocksFromGrammar(g);

    return {
      blocks,
      toolboxXml: this.loadToolbox(blocks, b),
    };
  }
}
