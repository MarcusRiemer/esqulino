import { QualifiedTypeName, NodeDescription } from '../syntaxtree'

/**
 * Describes how certain nodes in the syntaxtree should be presented
 * to an end user.
 */
export interface BlockDescription {
  /**
   * Nodes of this type are presented using this block.
   */
  describedType: QualifiedTypeName;

  /**
   * How this type should be represented in the sidebar.
   */
  sidebar: {
    category: string;
    displayName?: string;
  };

  /**
   * This description will be instanciated every time an "empty" node
   * is needed. This happens e.g. when the user starts dragging this
   * block from the sidebar.
   */
  defaultNode: NodeDescription;
}
