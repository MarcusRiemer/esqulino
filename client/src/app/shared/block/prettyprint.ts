import { recursiveJoin, NestedString } from '../nested-string'

import { LanguageModelDescription } from './language-model.description'
import { VisualBlockDescriptions, EditorBlockDescription } from './block.description'

/**
 * Converts the internal structure of a grammar into a more readable
 * version.
 */
export function prettyPrintLanguageModel(desc: LanguageModelDescription): string {
  const head = `language "${desc.name}" {`;
  const tail = `}`;

  const blocks = (desc.editorBlocks || []).map(prettyPrintBlockTypeHeader);

  const toReturn = [head, ...blocks, tail] as NestedString

  return (recursiveJoin('\n', '  ', toReturn));
}

export function prettyPrintBlockTypeHeader(desc: EditorBlockDescription): NestedString {
  const t = desc.describedType;
  const head = `type "${t.languageName}.${t.typeName}" {`;
  const tail = `}`;

  const visuals = (desc.visual || []).map(prettyPrintVisual)

  return ([head, ...visuals, tail]);
}

export function prettyPrintVisual(desc: VisualBlockDescriptions.ConcreteBlock): NestedString {
  switch (desc.blockType) {
    case "constant":
      return [`"${desc.text}"`]
    case "interpolated":
      return [`{{ ${desc.property} }}`]
    case "iterator":
      return prettyPrintVisualIterator(desc);
    case "dropTarget":
      return prettyPrintDropTarget(desc);
    case "block":
      return prettyPrintActualBlock(desc);
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

function prettyPrintDropTarget(desc: VisualBlockDescriptions.EditorDropTarget) {
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

function prettyPrintActualBlock(desc: VisualBlockDescriptions.EditorBlock) {
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
