export interface BlockArgsInputValue {
  type: "input_value";
  name: string;
}

export interface BlockArgsInputStatement {
  type: "input_statement";
  name: string;
}

export interface BlockArgsLabelSerializable {
  type: "field_label_serializable";
  name: string;
  text: string;
}

export interface BlockArgsFieldDropdown {
  type: "field_dropdown";
  name: string;
  // Index 0: Text value
  // Index 1: Internal value
  options: [string, string][];
}

export interface BlockArgsFieldInput {
  type: "field_input";
  name: string;
}

export interface BlockArgsNumberInput {
  type: "field_number";
  name: string;
}

// According to:
// https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/checkbox
export interface BlockArgsFieldCheckbox {
  type: "field_checkbox";
  name: string;
  checked?: boolean;
}

export type BlockArgs =
  | BlockArgsInputValue
  | BlockArgsInputStatement
  | BlockArgsLabelSerializable
  | BlockArgsFieldDropdown
  | BlockArgsFieldInput
  | BlockArgsNumberInput
  | BlockArgsFieldCheckbox;

/**
 * Home-grown subset of relevant Blockly properties
 */
export interface BlocklyBlock {
  type: string;
  message0: string;
  args0: BlockArgs[];
  // Set to a type for the allowed preceding statements, `null` for `any`
  previousStatement?: null | string;
  // Set to a type for the allowed following statements, `null` for `any`
  nextStatement?: null | string;
  // Set to a type for the allowed assignment expressions, `null` for `any`
  output?: null | string;

  colour: number;
  tooltip?: string;
  helpUrl?: string;
}
