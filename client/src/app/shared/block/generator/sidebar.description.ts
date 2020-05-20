import * as Constant from "../block.description";
import { QualifiedTypeName } from "../../syntaxtree/syntaxtree.description";

/**
 * A block that is given statically
 */
export interface ConstantSidebarBlockDescription
  extends Constant.SidebarBlockDescription {
  type: "constant";
}

/**
 * A block that has its block generated.
 */
export interface GeneratedSidebarBlockDescription {
  type: "generated";
  nodeType: QualifiedTypeName;
  displayName?: string;
}

/**
 * A category that is defined statically
 */
export interface ConstantBlocksSidebarCategoryDescription
  extends Constant.FixedBlocksSidebarCategoryDescription {
  type: "constant";
}

/**
 * A category description that may use partly generated blocks and
 * partly constant blocks.
 */
export interface MixedBlocksSidebarCategoryDescription {
  type: "mixed";
  categoryCaption: string;
  blocks: AnySidebarBlockDescription[];
}

/**
 * A category that uses only generated blocks. This allows for a syntax
 * that is a little more compact.
 */
export interface GeneratedBlocksSidebarCategoryDescription {
  type: "generated";
  categoryCaption: string;
  grammar: {
    [grammarName: string]: string[];
  };
}

/**
 * A sidebar description that may use partly generated blocks and partly
 * constant categories.
 */
export interface GeneratedBlocksSidebarDescription {
  type: "generatedBlocks";
  caption: string;
  categories: AnySidebarCategoryDescription[];
}

export type AnySidebarBlockDescription =
  | ConstantSidebarBlockDescription
  | GeneratedSidebarBlockDescription;
export type AnySidebarCategoryDescription =
  | ConstantBlocksSidebarCategoryDescription
  | MixedBlocksSidebarCategoryDescription
  | GeneratedBlocksSidebarCategoryDescription;
export type AnySidebarDescription =
  | Constant.SidebarDescription
  | GeneratedBlocksSidebarDescription;
