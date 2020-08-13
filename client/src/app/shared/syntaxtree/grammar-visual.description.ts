import * as Desc from "./grammar.description";

/**
 * These attributes are available when visualizing things
 */
export type VisualNodeAttributeDescription =
  | Desc.NodeTerminalSymbolDescription
  | Desc.NodeVisualContainerDescription
  | Desc.NodeInterpolateDescription;

export interface VisualNodeTypeDescription {
  type: "visualize";
  attributes: VisualNodeAttributeDescription[];
}
