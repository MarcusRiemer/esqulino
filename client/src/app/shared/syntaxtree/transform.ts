import {
  NodeDescription,
  NodeLocation,
  SyntaxNode,
  SyntaxTree,
} from "./syntaxtree";
import { Selector, SelectorRoot } from "./transform.description";

type Matching = {
  key: string;
  selector: Selector;
  value: NodeDescription;
};

/**
 *  Takes a syntax tree and a list of patterns as inputs and applies the transformations described by the patterns onto the given inout syntax tree.
 * @param inp Represents the input syntax tree that is to be transformed with the help of the defined patterns
 * @returns The transformed syntax tree for further evaluation and validation against the grammar.
 */

export function apply(inp: SyntaxTree, patterns): SyntaxTree {
  return inp;
}
