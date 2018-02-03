import { recursiveJoin, NestedString } from '../nested-string'

import { prettyPrintSyntaxTreeNode } from '../syntaxtree/prettyprint'

import { BlockLanguageDescription } from './block-language.description'
import {
  VisualBlockDescriptions, EditorBlockDescription, SidebarBlockDescription
} from './block.description'

/**
 * Converts the internal structure of a language model into a more readable
 * version.
 */
export function prettyPrintLanguageModel(desc: BlockLanguageDescription): string {
  const head = `language "${desc.name}" {`;
  const tail = `}`;

  const blocks = (desc.editorBlocks || []).map(prettyPrintBlockTypeHeader);
  const sidebar = (desc.sidebarBlocks || []).map(prettyPrintSidebarBlock);

  const toReturn = [head, ...blocks, ...sidebar, tail] as NestedString

  return (recursiveJoin('\n', '  ', toReturn));
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
      return [JSON.stringify(desc.text)]
    case "interpolated":
      return [`{{ ${desc.property} }}`]
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

  return ([head, [...props, ...between], tail]);
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

  return ([head, [...props, ...children], tail]);
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

  return ([head, [...props, ...children], tail]);
}

function prettyPrintSidebarBlock(desc: SidebarBlockDescription) {
  const head = `sidebarBlock "${desc.sidebar.displayName}" {`

  const props = [
    `category "${desc.sidebar.category}"`
  ]

  const defaultNode = desc.defaultNode
    ? prettyPrintSyntaxTreeNode(desc.defaultNode)
    : [];

  const tail = `}`;

  return ([head, [...props, ...defaultNode], tail]);
}
