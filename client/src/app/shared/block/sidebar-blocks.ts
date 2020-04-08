import { NodeDescription } from "../syntaxtree";

import {
  FixedBlocksSidebarDescription,
  FixedBlocksSidebarCategoryDescription,
  SidebarBlockDescription,
} from "./block.description";
import { BlockLanguage } from "./block-language.forward";
import { Sidebar } from "./sidebar";

/**
 * This is how a certain type will be made availabe for the user
 * in the sidebar.
 */
export class FixedSidebarBlock {
  /**
   * The caption that is displayed for this block.
   */
  public readonly displayName: string;

  /**
   * @return The node that should be created when this block
   *         needs to be instanciated.
   */
  public readonly defaultNode: NodeDescription[];

  constructor(desc: SidebarBlockDescription) {
    this.displayName = desc.displayName;

    if (Array.isArray(desc.defaultNode)) {
      this.defaultNode = desc.defaultNode;
    } else {
      this.defaultNode = [desc.defaultNode];
    }
  }
}

/**
 * Groups together blocks.
 */
export interface BlocksSidebarCategory {
  readonly blocks: ReadonlyArray<FixedSidebarBlock>;
  readonly displayName: string;
}

export class FixedBlocksSidebarCategory implements BlocksSidebarCategory {
  /**
   * The caption that is displayed for this category.
   */
  public readonly displayName: string;

  public readonly blocks: ReadonlyArray<FixedSidebarBlock>;

  constructor(
    _parent: FixedBlocksSidebar,
    desc: FixedBlocksSidebarCategoryDescription
  ) {
    this.displayName = desc.categoryCaption;
    this.blocks = desc.blocks.map(
      (blockDesc) => new FixedSidebarBlock(blockDesc)
    );
  }
}

/**
 * Groups together possible actions inside a sidebar. This is a
 * structure with three levels:
 * 1) Sidebar
 * 2) Category
 * 3) Block
 */
export class FixedBlocksSidebar implements Sidebar {
  readonly portalComponentTypeId = "fixedBlocks";

  /**
   * The caption that is displayed for this sidebar.
   */
  public readonly displayName: string;

  /**
   * The categories the blocks are sorted in to
   */
  public readonly categories: ReadonlyArray<BlocksSidebarCategory>;

  constructor(_parent: BlockLanguage, desc: FixedBlocksSidebarDescription) {
    this.displayName = desc.caption;
    this.categories = desc.categories.map((catDesc) => {
      return new FixedBlocksSidebarCategory(this, catDesc);
    });
  }
}
