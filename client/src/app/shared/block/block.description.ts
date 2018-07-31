import { QualifiedTypeName, NodeDescription } from '../syntaxtree/syntaxtree.description'

export type Orientation = "horizontal" | "vertical";

/**
 * Groups together all available options to describe a block in the
 * drag & drop UI.
 */
export namespace VisualBlockDescriptions {

  /**
   * We currently allow any CSS style to be used.
   *
   * TODO: This could be a Readonly<> type but that causes the JSON-
   * schema generator to (sort of rightfully) emit false for
   * "additionalProperties" and that in turn makes this type rather
   * pointless.
   */
  export type BlockStyle = { [k: string]: string };

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

    // Drops something into a category
    children?: CategoryInsert;

    // Drops something into a category of the parent
    parent?: CategoryInsert;

    visibility?: ("ifAnyDrag" | "ifLegalDrag" | "ifLegalChild" | "ifEmpty" | "always")[];
  }

  /**
   * Allows very basic control over the layout of blocks. This is meant
   * to be used for alignments in rows and columns, not for anything
   * involving actual design.
   */
  export interface EditorLayout extends EditorBlockBase {
    direction: Orientation;
    children?: ConcreteBlock[];
    wrapChildren?: boolean;
  }

  /**
   * Describes how a certain block should be represented. Blocks are
   * always draggable and also possible drop targets.
   */
  export interface EditorBlock extends EditorLayout {
    blockType: "block";
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

  /**
   * Displays an interpolated value and allows it to be edited.
   */
  export interface EditorInput extends EditorBlockBase {
    blockType: "input";
    property: string;
  }

  /**
   * Shows a marker if there is some kind of error
   */
  export interface EditorErrorMarker extends EditorBlockBase {
    blockType: "error";
  }

  export type ConcreteBlock = EditorBlock | EditorDropTarget | EditorIterator | EditorConstant | EditorInterpolated | EditorInput | EditorErrorMarker;

  // Default to inserting after the given node. This should be a meaningful default ...
  export const DefaultDropTargetProperties: DropTargetProperties = {
    self: {
      order: "insertAfter",
      skipParents: 0
    }
  }
}

/**
 * Describes how the available types should be represented in the sidebar.
 * It is perfectly fine to have multiple sidebar descriptions for the
 * same underlying type.
 */
export interface SidebarBlockDescription {
  /**
   * The name to be displayed in the sidebar
   */
  displayName: string;

  /**
   * This description will be instanciated every time an "empty" node
   * is needed. This happens e.g. when the user starts dragging this
   * block from the sidebar.
   */
  defaultNode: NodeDescription;
}

/**
 * Defines which blocks to show in a certain category.
 */
export interface FixedBlocksSidebarCategoryDescription {
  categoryCaption: string;
  blocks: SidebarBlockDescription[];
}

/**
 * Defines the overall look of a sidebar. It at least sorts available blocks
 * into categories.
 */
export interface FixedBlocksSidebarDescription {
  /**
   * Unique identification for this type.
   */
  type: "fixedBlocks"

  /**
   * The name that should be displayed to the user.
   */
  caption: string

  /**
   * The actual blocks are categorized into categories.
   */
  categories: FixedBlocksSidebarCategoryDescription[]
}

export interface DatabaseSchemaSidebarDescription {
  /**
   * Unique identification for this type.
   */
  type: "databaseSchema"
}

/**
 * All possible sidebar types
 */
export type SidebarDescription = FixedBlocksSidebarDescription | DatabaseSchemaSidebarDescription;

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
