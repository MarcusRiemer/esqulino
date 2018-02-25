import { recursiveJoin, NestedString } from '../nested-string'

import { prettyPrintSyntaxTreeNode } from '../syntaxtree/prettyprint'

import { BlockLanguageDescription } from './block-language.description'
import {
  VisualBlockDescriptions, EditorBlockDescription, SidebarBlockDescription,
  SidebarDescription, FixedBlocksSidebarCategoryDescription
} from './block.description'

/**
 * Converts the internal structure of a language model into a more readable
 * version.
 */
export function prettyPrintLanguageModel(desc: BlockLanguageDescription): string {
  const head = `language "${desc.name}" {`;
  const tail = `}`;

  const blocks = (desc.editorBlocks || []).map(prettyPrintBlockTypeHeader);
  const sidebar = (desc.sidebars || []).map(prettyPrintSidebar);

  const toReturn = [head, ...blocks, ...sidebar, tail] as NestedString

  return (recursiveJoin('\n', '  ', toReturn));
}

export function prettyPrintStyle(desc: VisualBlockDescriptions.BlockStyle) {
  const properties = Object.entries(desc || {})
    .map(([k, v]) => `${k}: ${v}`)

  if (properties.length > 0) {
    return ([`style {`, properties, `}`]);
  } else {
    return ([]);
  }
}

/**
 * The initial portion of a definition of a block.
 */
export function prettyPrintBlockTypeHeader(desc: EditorBlockDescription): NestedString {
  const t = desc.describedType;
  const head = `type "${t.languageName}.${t.typeName}" {`;
  const tail = `}`;

  const visuals = (desc.visual || []).map(prettyPrintVisual)

  return ([head, ...visuals, tail]);
}

/**
 * The text representation of the visual representation of a type.
 */
export function prettyPrintVisual(desc: VisualBlockDescriptions.ConcreteBlock): NestedString {
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
      return prettyPrintVisualBlock(desc);
    default:
      throw new Error(`Unknow visual block "${(desc as any).blockType}"`);
  }
}

/**
 * Prettyprints a constant. If there is no style it does so in the short form.
 */
function prettyPrintSingleLine(single: string, desc: VisualBlockDescriptions.EditorBlockBase) {
  const style = prettyPrintStyle(desc.style);
  if (style.length > 0) {
    return ([`${single} {`, style, `}`]);
  } else {
    return ([single]);
  }
}

/**
 * Prettyprints an iterator block.
 */
function prettyPrintVisualIterator(desc: VisualBlockDescriptions.EditorIterator): NestedString {
  const head = `iterate {`;

  // For the moment the mandatory properties have to be stated verbosely
  const props = [
    `childGroup "${desc.childGroupName}"`,
    `direction ${desc.direction}`
  ]

  // The between property is optional
  const between = (desc.between)
    ? ["between {", ...desc.between.map(prettyPrintVisual), "}"]
    : [];

  const tail = `}`;

  return ([head, [...props, ...between, ...prettyPrintStyle(desc.style)], tail]);
}

/**
 * Prettyprints drop targets.
 */
function prettyPrintVisualDropTarget(desc: VisualBlockDescriptions.EditorDropTarget) {
  const head = `dropTarget {`;

  // For the moment the mandatory properties have to be stated verbosely
  const props = [
    `visibility ${desc.visibility.join(' ')}`,
    `direction ${desc.direction}`
  ]

  // The between property is optional
  const children = (desc.children)
    ? ["visual {", ...desc.children.map(prettyPrintVisual), "}"]
    : [];

  const tail = `}`;

  return ([head, [...props, ...children, ...prettyPrintStyle(desc.style)], tail]);
}

/**
 * Prettyprints actual blocks.
 */
function prettyPrintVisualBlock(desc: VisualBlockDescriptions.EditorBlock) {
  const head = `block {`;

  // For the moment the mandatory properties have to be stated verbosely
  const props = [
    `direction ${desc.direction}`
  ]

  // The between property is optional
  const children = (desc.children)
    ? ["visual {", ...desc.children.map(prettyPrintVisual), "}"]
    : [];

  const tail = `}`;

  return ([head, [...props, ...children, ...prettyPrintStyle(desc.style)], tail]);
}

/**
 * Prettyprints a whole sidebar.
 */
function prettyPrintSidebar(desc: SidebarDescription) {
  switch (desc.type) {
    case "fixedBlocks": return ([
      `fixedBlocks "${desc.caption}" {`,
      ...desc.categories.map(prettyPrintFixedBlocksSidebarCategory),
      `}`
    ]);
    case "databaseSchema": return (["databaseSchema"]);
  }
}

/**
 * Prettyprints the category of a sidebar
 */
function prettyPrintFixedBlocksSidebarCategory(desc: FixedBlocksSidebarCategoryDescription) {
  return ([
    `category "${desc.categoryCaption}" {`,
    ...desc.blocks.map(prettyPrintSidebarBlock),
    `}`
  ]);
}



/**
 * Prettyprints a block in the sidebar
 */
function prettyPrintSidebarBlock(desc: SidebarBlockDescription) {
  const head = `sidebarBlock "${desc.displayName}" {`

  const defaultNode = desc.defaultNode
    ? prettyPrintSyntaxTreeNode(desc.defaultNode)
    : [];

  const tail = `}`;

  return ([head, [...defaultNode], tail]);
}
