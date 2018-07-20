import { Orientation } from '../block.description'

/**
 * All customization instructions that may be specified by a user.
 */
export interface Instructions {
  orientation: Orientation;
  between: string;
  style: { [attribute: string]: string }
}

export type LayoutInstructions = Readonly<Pick<Instructions, "orientation" | "between" | "style">>;
export type BlockInstructions = Readonly<Pick<Instructions, "orientation" | "style">>;
export type TerminalInstructions = Readonly<Pick<Instructions, "style">>;

export module DefaultInstructions {
  export const iteratorInstructions: LayoutInstructions = {
    orientation: "horizontal",
    between: "",
    style: {}
  }

  export const blockInstructions: BlockInstructions = {
    orientation: "horizontal",
    style: {}
  }

  export const terminalInstructions: TerminalInstructions = {
    style: {
      "display": "inline-block"
    }
  }
}

/**
 * Supplementary generation instructions for a specific type.
 */
export type TypeInstructions = {
  [language: string]: {
    [type: string]: {
      [scope: string]: Partial<Instructions>
    }
  }
}
