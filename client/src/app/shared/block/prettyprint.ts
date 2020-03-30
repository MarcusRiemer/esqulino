import { recursiveJoin, NestedString } from "../nested-string";

import { prettyPrintSyntaxTreeNode } from "../syntaxtree/prettyprint";

import {
  BlockLanguageDescription,
  BlockLanguageDocument,
  isBlockLanguageDescription,
} from "./block-language.description";
import {
  VisualBlockDescriptions,
  EditorBlockDescription,
  SidebarDescription,
  SidebarBlockDescription,
  FixedBlocksSidebarCategoryDescription,
} from "./block.description";

/**
 * Converts the internal structure of a language model into a more readable
 * version.
 */
export function prettyPrintBlockLanguage(
  desc: BlockLanguageDescription
): string;
export function prettyPrintBlockLanguage(
  desc: BlockLanguageDocument,
  name: string
): string;
export function prettyPrintBlockLanguage(
  desc: BlockLanguageDocument | BlockLanguageDescription,
  name?: string
): string {
  const actualName = isBlockLanguageDescription(desc) ? desc.name : name;
  const head = `language "${actualName}" {`;
  const tail = `}`;

  const blocks = (desc.editorBlocks || []).map(prettyPrintBlockTypeHeader);
  const sidebar = (desc.sidebars || []).map(prettyPrintSidebar);

  const toReturn = [head, ...blocks, ...sidebar, tail] as NestedString;

  return recursiveJoin("\n", "  ", toReturn);
}

/**
 * Prettyprints style definitions.
 */
export function prettyPrintStyle(desc: VisualBlockDescriptions.BlockStyle) {
  const properties = Object.entries(desc || {}).map(([k, v]) => `${k}: ${v}`);

  if (properties.length > 0) {
    return [`style {`, properties, `}`];
  } else {
    return [];
  }
}

/**
 * The initial portion of a definition of a block.
 */
export function prettyPrintBlockTypeHeader(
  desc: EditorBlockDescription
): NestedString {
  const t = desc.describedType;
  const head = `type "${t.languageName}.${t.typeName}" {`;
  const tail = `}`;

  const visuals = (desc.visual || []).map(prettyPrintVisual);

  return [head, ...visuals, tail];
}

/**
 * The text representation of the visual representation of a type.
 */
export function prettyPrintVisual(
  desc: VisualBlockDescriptions.ConcreteBlock
): NestedString {
  switch (desc.blockType) {
    case "constant":
      return prettyPrintSingleLine(JSON.stringify(desc.text), desc);
    case "interpolated":
      return prettyPrintSingleLine(`{{ ${desc.property} }}`, desc);
    case "iterator":
      return prettyPrintVisualIterator(desc);
    case "dropTarget":
      return prettyPrintVisualDropTarget(desc);
    case "block":
    case "container":
      return prettyPrintLayoutBlock(desc);
    case "input":
      return [`TODO: input blocks`];
    case "error":
      return [`TODO: error blocks`];
    default:
      throw new Error(`Unknow visual block "${(desc as any).blockType}"`);
  }
}

/**
 * Prettyprints a constant. If there is no style it does so in the short form.
 */
function prettyPrintSingleLine(
  single: string,
  desc: VisualBlockDescriptions.EditorBlockBase
) {
  const style = prettyPrintStyle(desc.style);
  if (style.length > 0) {
    return [`${single} {`, style, `}`];
  } else {
    return [single];
  }
}

/**
 * Prettyprints an iterator block.
 */
function prettyPrintVisualIterator(
  desc: VisualBlockDescriptions.EditorIterator
): NestedString {
  const head = `iterate {`;

  // For the moment the mandatory properties have to be stated verbosely
  const props = [`childGroup "${desc.childGroupName}"`];

  // The between property is optional
  const between = desc.between
    ? ["between {", ...desc.between.map(prettyPrintVisual), "}"]
    : [];

  const emptyDropTarget = desc.emptyDropTarget
    ? [`emptyDropTarget ${desc.emptyDropTarget}`]
    : [];

  const tail = `}`;

  return [
    head,
    [...props, ...between, ...emptyDropTarget, ...prettyPrintStyle(desc.style)],
    tail,
  ];
}

/**
 * Prettyprints drop targets.
 */
function prettyPrintVisualDropTarget(
  desc: VisualBlockDescriptions.EditorDropTarget
) {
  const head = `dropTarget {`;

  // For the moment the mandatory properties have to be stated verbosely
  const props = [];

  const dropTarget = desc.dropTarget
    ? prettyPrintDropTargetProperties(desc.dropTarget)
    : [];

  // The between property is optional
  const children = desc.children
    ? ["visual {", ...desc.children.map(prettyPrintVisual), "}"]
    : [];

  const tail = `}`;

  return [
    head,
    [...props, ...dropTarget, ...children, ...prettyPrintStyle(desc.style)],
    tail,
  ];
}

/**
 * Prettyprints actual blocks.
 */
function prettyPrintLayoutBlock(
  desc:
    | VisualBlockDescriptions.EditorContainer
    | VisualBlockDescriptions.EditorBlock
) {
  const head = `${desc.blockType} {`;

  const props = [];

  const dropTarget =
    desc.blockType === "block" && desc.dropTarget
      ? prettyPrintDropTargetProperties(desc.dropTarget)
      : [];

  // The between property is optional
  const children = desc.children
    ? ["visual {", ...desc.children.map(prettyPrintVisual), "}"]
    : [];

  const tail = `}`;

  return [
    head,
    [...props, ...dropTarget, ...children, ...prettyPrintStyle(desc.style)],
    tail,
  ];
}

/**
 * Pretty prints properties for drop operations.
 */
function prettyPrintDropTargetProperties(
  desc: VisualBlockDescriptions.DropTargetProperties
): NestedString {
  const head = `dropOptions {`;

  const middle: string[] = [];

  if (desc.visibility) {
    middle.push(`visible ${JSON.stringify(desc.visibility)}`);
  }

  const tail = `}`;

  return [head, middle, tail];
}

/**
 * Prettyprints a whole sidebar.
 */
function prettyPrintSidebar(desc: SidebarDescription) {
  switch (desc.type) {
    case "fixedBlocks":
      return [
        `fixedBlocksSidebar "${desc.caption}" {`,
        ...desc.categories.map(prettyPrintFixedBlocksSidebarCategory),
        `}`,
      ];
    case "databaseSchema":
      return ["databaseSchemaSidebar"];
  }
}

/**
 * Prettyprints the category of a sidebar
 */
function prettyPrintFixedBlocksSidebarCategory(
  desc: FixedBlocksSidebarCategoryDescription
) {
  return [
    `category "${desc.categoryCaption}" {`,
    ...desc.blocks.map(prettyPrintSidebarBlock),
    `}`,
  ];
}

/**
 * Prettyprints a block in the sidebar
 */
function prettyPrintSidebarBlock(desc: SidebarBlockDescription) {
  const head = `sidebarBlock "${desc.displayName}" {`;

  const defaultNode = desc.defaultNode
    ? prettyPrintSyntaxTreeNode(desc.defaultNode)
    : [];

  const tail = `}`;

  return [head, [...defaultNode], tail];
}
