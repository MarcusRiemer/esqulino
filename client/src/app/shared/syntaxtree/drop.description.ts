import { NodeLocation, NodeDescription } from "./syntaxtree.description";

/**
 * Possibilities to take into account when making a smart drop.
 */
export interface SmartDropOptions {
  allowEmbrace?: boolean;
  allowAnyParent?: boolean;
  allowExact?: boolean;
};

/**
 * A drop operation that would not "worsen" the tree by violating
 * basic type or cardinality laws.
 */
export type SmartDropLocation = InsertDropLocation | ReplaceDropLocation | EmbraceDropLocation;

/**
 * An insertion at the given location.
 */
export interface InsertDropLocation {
  operation: "insert";
  location: NodeLocation;
  nodeDescription: NodeDescription;
}

/**
 * A replacement of whatever is at the given location.
 */
export interface ReplaceDropLocation {
  operation: "replace";
  location: NodeLocation;
  nodeDescription: NodeDescription;
}

/**
 * An embrace at the given location.
 */
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
