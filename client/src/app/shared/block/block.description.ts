import { QualifiedTypeName, NodeDescription } from '../syntaxtree'

/**
 * Describes how certain nodes of the syntaxtree should be presented
 * inside the drag and drop editor.
 */
export interface EditorBlockBase {
  blockType: string;
}

/**
 * Describes how a certain block should be represented as a whole line.
 */
export interface EditorBlock extends EditorBlockBase {
  blockType: "line";
  children: EditorBlockBase[];
}

export interface EditorIterator extends EditorBlockBase {
  blockType: "iterator";
  childGroupName: string;
  childTemplate: EditorBlockBase;
}

export interface EditorConstant extends EditorBlockBase {
  blockType: "constant";
  text: string;
}

export interface EditorInterpolation extends EditorBlockBase {
  blockType: "interpolated";
  property: string;
}

/**
 * Describes how certain nodes in the syntaxtree should be presented
 * to an end user as a whole. This includes the representation in the
 * sidebar and in the drag and drop editor.
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

  /**
   * The visual representation of this block in the drag & drop editor.
   */
  visual?: EditorBlockBase;
}
