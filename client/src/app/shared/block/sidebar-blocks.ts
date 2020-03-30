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
  private _description: SidebarBlockDescription;
  private _defaultNode: NodeDescription[];

  constructor(desc: SidebarBlockDescription) {
    this._description = desc;

    if (Array.isArray(this._description.defaultNode)) {
      this._defaultNode = this._description.defaultNode;
    } else {
      this._defaultNode = [this._description.defaultNode];
    }
  }

  /**
   * @return The node that should be created when this block
   *         needs to be instanciated.
   */
  get defaultNode(): NodeDescription[] {
    return this._defaultNode;
  }

  /**
   * @return A friendly name that should be displayed to the user.
   */
  get displayName() {
    return this._description.displayName;
  }
}

/**
 * Groups together blocks.
 */
export interface BlocksSidebarCategory {
  readonly blocks: FixedSidebarBlock[];
  readonly showDisplayName: boolean;
  readonly displayName: string;
}

export class FixedBlocksSidebarCategory implements BlocksSidebarCategory {
  private _blocks: FixedSidebarBlock[] = [];
  private _caption: string;
  private _sidebar: FixedBlocksSidebar;

  constructor(
    parent: FixedBlocksSidebar,
    desc: FixedBlocksSidebarCategoryDescription
  ) {
    this._sidebar = parent;
    this._caption = desc.categoryCaption;
    this._blocks = desc.blocks.map(
      (blockDesc) => new FixedSidebarBlock(blockDesc)
    );
  }

  get blocks() {
    return this._blocks;
  }

  /**
   * If this is the only category inside the sidebar displaying its title might be noisy.
   */
  get showDisplayName() {
    return this._sidebar.categories.length > 1;
  }

  get displayName() {
    return this._caption;
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
  private _categories: BlocksSidebarCategory[] = [];
  private _caption: string;

  constructor(_parent: BlockLanguage, desc: FixedBlocksSidebarDescription) {
    this._caption = desc.caption;
    this._categories = desc.categories.map((catDesc) => {
      return new FixedBlocksSidebarCategory(this, catDesc);
    });
  }

  get displayName() {
    return this._caption;
  }

  get categories() {
    return this._categories;
  }

  get portalComponentTypeId() {
    return "fixedBlocks";
  }
}
