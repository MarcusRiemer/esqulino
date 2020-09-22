import { Injectable } from "@angular/core";

import { GrammarDescription } from "../../../shared";

interface BlocklyBlock {
  type: string;
  message0: string;
  args0: {
    type: string;
    name: string;
  }[];
  previousStatement: null | string;
  nextStatement: null | string;
  colour: number;
  tooltip: string;
  helpUrl: string;
}

@Injectable()
export class BlocklyBlocksService {
  private readonly _sql: BlocklyBlock[] = [
    {
      type: "sql_select",
      message0: "SELECT %1 %2",
      args0: [
        {
          type: "input_value",
          name: "NAME",
        },
        {
          type: "input_statement",
          name: "NAME",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 230,
      tooltip: "",
      helpUrl: "",
    },
  ];

  loadBlocks(): BlocklyBlock[] {
    return this._sql;
  }

  loadToolbox(): string {
    const blocksXml = this._sql.map((b) => `<block type="${b.type}"></block>`);
    return `
      <xml xmlns="https://developers.google.com/blockly/xml" id="toolbox-simple" style="display: none">
        ${blocksXml.join()}
      </xml>`;
  }

  load(): { blocks: BlocklyBlock[]; toolbox: string } {
    return {
      blocks: this.loadBlocks(),
      toolbox: this.loadToolbox(),
    };
  }
}
