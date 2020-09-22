import { Injectable } from "@angular/core";

import { GrammarDocument } from "../../../shared/syntaxtree";

import { BlocklyBlock } from "../../../shared/block/blockly/blockly-types";
import { createBlocks } from "../../../shared/block/blockly/create-blocks";

@Injectable()
export class BlocklyBlocksService {
  private readonly _sql: BlocklyBlock[] = [
    {
      type: "sql_select",
      message0: "SELECT %1",
      args0: [
        {
          type: "input_value",
          name: "COLUMNS",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
    },
    {
      type: "sql_column",
      message0: "%1 . %2 %3",
      args0: [
        {
          type: "field_label_serializable",
          name: "TABLE_NAME",
          text: "PERSON",
        },
        {
          type: "field_dropdown",
          name: "COLUMN_NAME",
          options: [
            ["ID", "id"],
            ["NAME", "NAME"],
          ],
        },
        {
          type: "input_value",
          name: "NAME",
        },
      ],
      output: null,
      colour: 230,
    },
  ];

  loadToolbox(blocks: BlocklyBlock[]): string {
    const blocksXml = blocks.map((b) => `<block type="${b.type}"></block>`);
    return `
      <xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-simple" style="display: none">
        ${blocksXml.join()}
      </xml>`;
  }

  load(g: GrammarDocument): { blocks: BlocklyBlock[]; toolbox: string } {
    let blocks = this._sql;
    if (g) {
      blocks = createBlocks(g);
    }

    return {
      blocks,
      toolbox: this.loadToolbox(blocks),
    };
  }
}
