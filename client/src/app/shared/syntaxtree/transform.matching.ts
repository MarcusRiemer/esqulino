import { NodeLocation, SyntaxNode, SyntaxTree } from "./syntaxtree";
import { Selector } from "./transform.description";

/**
 * Tests whether a given node matches against a given selector.
 * @param node The node to match.
 * @param selector The selector to match against.
 * @returns true if the matching is successful, false otherwise.
 */

export function doesNodeMatchSelector(
  node: SyntaxNode,
  selector: Selector
): boolean {
  if(node === undefined) return false; // Nothing matches against an empty or undefined Node.
  let to_return = true;
  //TODO: NotSelector implementation
  switch (selector.kind) {
    case "root":
      if (node.nodeParent === undefined) return true;
      // Root has no parent node
      else return false;
    case "type":
      const nodeQualifiedName = node.qualifiedName;
      if (selector.name) {
        // check the names match
        to_return = to_return && node.qualifiedName.typeName === selector.name;
      }
      if (selector.language) {
        // check the languages match
        to_return =
          to_return && node.qualifiedName.languageName === selector.language;
      }
      if (selector.hasChildGroup) {
        // check the node has the given childgroup
        to_return =
          to_return &&
          node.childrenCategoryNames.includes(selector.hasChildGroup);
      }
      return to_return;
    case "negate":
      if (selector === undefined)
        throw new Error("No selector defined for the not Selector");
      return !doesNodeMatchSelector(node, selector.selector);

    case "all":
      // no selectors match nothing
      if (selector.selectors.length === 0) return false;
      else {
        for (let sel of selector.selectors)
          to_return = to_return && doesNodeMatchSelector(node, sel);
        return to_return;
      }
    case "any":
      to_return = false; // For this case, must start with false
      // no selectors match nothing
      if (selector.selectors.length === 0) return false;
      else {
        for (let sel of selector.selectors)
          to_return = to_return || doesNodeMatchSelector(node, sel);
        return to_return;
      }
    case "immediateChild":
      return (doesNodeMatchSelector(node, selector.child) && doesNodeMatchSelector(node.nodeParent, selector.parent));
    case "property-simple":
      // nothing to match against
      if (!node.hasProperties) return false;
      // node having no property with given name means no match
      // This is needed to avoid matching against "undefined" accidentally.
      else if (!node.properties[selector.name]) return false;
      else {
        let minLength =
          selector.propertyValueMinLength !== undefined
            ? selector.propertyValueMinLength
            : 0;

        // Length pattern
        let regexLengthPattern = "^.{" + minLength + ",";
        if (selector.propertyValueMaxLength)
          regexLengthPattern += selector.propertyValueMaxLength;
        regexLengthPattern += "}$";
        let lengthRegex = new RegExp(regexLengthPattern);

        // Contains pattern
        let containsRegexPattern =
          selector.propertyContainsValue !== undefined
            ? "^.*" + selector.propertyContainsValue + ".*$"
            : ".*";
        let containsRegex = new RegExp(containsRegexPattern);
        return (
          lengthRegex.test(node.properties[selector.name]) &&
          containsRegex.test(node.properties[selector.name])
        );
      }
    case "property-regex":
      // nothing to match against
      if (!node.hasProperties) return false;
      // node having no property with given name means no match
      else if (!node.properties[selector.name]) return false;
      else {
        // regex pattern matching test
        let regex = new RegExp(selector.regexPattern);
        return regex.test(node.properties[selector.name]);
      }
    default:
      return false;
  }
}

/**
 * Takes a syntax tree's root and a selector and gives back a list of matches.
 * Matching is done using a DFS algorithm for visiting all nodes of the trees.
 * The resulting matchings appear on a postfix order. This would allow for transforming
 * the children nodes in such a way, that the node locations found by the findMatches
 * functions do not lose relevence after the first transformation.
 * @param inp Represents the input syntax tree that is to be searched through
 * @param selector Represents to selector that should be matched against
 * @return a list of locations for the nodes that matched.
 */

export function findMatches(
  inp: SyntaxNode,
  selector: Selector
): NodeLocation[] {
  let to_return: NodeLocation[] = [];
  const subtreeRootNode = inp;

  // Recursively apply to all children
  if (subtreeRootNode.hasChildren) {
    subtreeRootNode.childrenCategoryNames.forEach((category) => {
      let children = subtreeRootNode.getChildrenInCategory(category);
      // TODO: Change to start from the righmost child.
      children.forEach((child) => {
        to_return.push(...findMatches(child, selector));
      });
    });
  }

  // Does the current root node match?
  if (doesNodeMatchSelector(subtreeRootNode, selector)) {
    to_return.push(subtreeRootNode.location);
  }

  return to_return;
}
