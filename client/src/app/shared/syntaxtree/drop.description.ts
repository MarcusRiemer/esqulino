import { NodeLocation, NodeDescription } from "./syntaxtree.description";

/**
 * A drop operation that would not "worsen" the tree by violating
 * basic type or cardinality laws.
 */
export type SmartDropLocation = InsertDropLocation | EmbraceDropLocation;

export interface InsertDropLocation {
  operation: "insert";
  location: NodeLocation;
  nodeDescription: NodeDescription;
}

export interface EmbraceDropLocation {
  operation: "embrace";
  location: NodeLocation;
  nodeDescription: NodeDescription;
  /**
   * Where the given location in the tree should be placed inside the
   * candidate.
   */
  candidateHole: NodeLocation;
}
