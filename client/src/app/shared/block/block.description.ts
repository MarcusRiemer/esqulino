import { QualifiedTypeName, NodeDescription } from '../syntaxtree/syntaxtree.description'

/**
 * Groups together all available options to describe a block in the
 * drag & drop UI.
 */
export namespace VisualBlockDescriptions {

  /**
   * We currently allow any CSS style to be used.
   */
  export type BlockStyle = { [k: string]: string }

  /**
   * Describes how certain nodes of the syntaxtree should be presented
   * inside the drag and drop editor. As the available blocks are very
   * different, this "base" interface consists of nothing but the
   * discriminator value.
   */
  export interface EditorBlockBase {
    blockType: string;
    style?: BlockStyle;
  }

  /**
   * The locations of categories at which insertions may occur.
   */
  export type CategoryInsertPosition = "insertFirst" | "insertLast";

  export type CategoryInsert = {
    order: CategoryInsertPosition;
    category: string;
  };

  /**
   * These properties are required to specify drop targets.
   */
  export interface DropTargetProperties {
    // Drops something into the same category as the relevant node
    self?: {
      order: "insertBefore" | "insertAfter";
      skipParents: number;
    };

    children?: CategoryInsert;

    parent?: CategoryInsert;
  }

  /**
   * Allows very basic control over the layout of blocks. This is meant
   * to be used for alignments in rows and columns, not for anything
   * involving actual design.
   */
  export interface EditorLayout extends EditorBlockBase {
    direction: "horizontal" | "vertical";
  }

  /**
   * Describes how a certain block should be represented. Blocks are
   * always draggable and also possible drop targets.
   */
  export interface EditorBlock extends EditorLayout {
    blockType: "block";
    children?: ConcreteBlock[];
    dropTarget?: DropTargetProperties;
    dropAction?: "append" | "replace";
  }

  /**
   * Describes a "block" that only acts as a hole to drop things at.
   * It is not necesarily visible in every state and it is not draggable.
   */
  export interface EditorDropTarget extends EditorLayout {
    blockType: "dropTarget";
    children?: ConcreteBlock[];
    dropTarget?: DropTargetProperties;
    visibility: ["ifAnyDrag" | "ifLegalDrag" | "ifLegalChild" | "ifEmpty" | "always"];
  }

  /**
   * Allows to iterate over all blocks in a certain category.
   */
  export interface EditorIterator extends EditorLayout {
    blockType: "iterator";
    childGroupName: string;
    between?: ConcreteBlock[]
  }

  /**
   * Displays a constant value that does not allow any user interaction.
   */
  export interface EditorConstant extends EditorBlockBase {
    blockType: "constant";
    text: string;
  }

  /**
   * Displays a dynamic value that depends on some property of the node but
   * does not allow to edit the property.
   */
  export interface EditorInterpolated extends EditorBlockBase {
    blockType: "interpolated";
    property: string;
  }

  export type ConcreteBlock = EditorBlock | EditorDropTarget | EditorIterator | EditorConstant | EditorInterpolated;
}

/**
 * Describes how the available types should be represented in the sidebar.
 * It is perfectly fine to have multiple sidebar descriptions for the
 * same underlying type.
 */
export interface SidebarBlockDescription {
  /**
   * How this block should be represented in the sidebar.
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

/**
 * Describes how certain nodes in the syntaxtree should be presented
 * to an end user inside the drag & drop interface.
 */
export interface EditorBlockDescription {
  /**
   * Nodes of this type are presented using this block.
   */
  describedType: QualifiedTypeName;

  /**
   * The actual visual representation.
   */
  visual: VisualBlockDescriptions.ConcreteBlock[];
}
