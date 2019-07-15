import { VisualBlockDescriptions } from '../block.description';

function readableClass(b: VisualBlockDescriptions.ConcreteBlock) {
  if (b.cssClasses && b.cssClasses.length > 0) {
    return (` class="${b.cssClasses.join(' ')}"`);
  } else {
    return ("");
  }
}

/**
 * A (hopefully) stable and stripped down representation of constant
 * aspects of a visual block. This completly disregards any data that
 * could possibly be part of a real tree.
 */
export function readableConstants(all: VisualBlockDescriptions.ConcreteBlock[]): string {
  let toReturn = "";
  all.forEach(b => {
    switch (b.blockType) {
      case "constant":
        toReturn += b.text;
        break;
      case "block":
      case "container":
        toReturn += `<${b.blockType}${readableClass(b)}>` + readableConstants(b.children || []) + `</${b.blockType}>`;
        break;
      case "iterator":
        toReturn += `<iterator childGroup="${b.childGroupName}">`;
        break;
    }
  });

  return (toReturn);
}