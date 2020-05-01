import { VisualBlockDescriptions } from "../block.description";

function readableClass(
  b:
    | VisualBlockDescriptions.EditorBlock
    | VisualBlockDescriptions.EditorContainer
) {
  let printedClasses = b.cssClasses ?? [];
  if (b.blockType === "container") {
    printedClasses.push(b.orientation);
  }

  if (printedClasses.length > 0) {
    return ` class="${printedClasses.join(" ")}"`;
  } else {
    return "";
  }
}

/**
 * A (hopefully) stable and stripped down representation of constant
 * aspects of a visual block. This completly disregards any data that
 * could possibly be part of a real tree.
 */
export function readableConstants(
  all: VisualBlockDescriptions.ConcreteBlock[]
): string {
  let toReturn = "";
  all.forEach((b) => {
    switch (b.blockType) {
      case "constant":
        if (
          b.cssClasses?.includes("space-before") ||
          b.cssClasses?.includes("space-around")
        ) {
          toReturn += " ";
        }

        if (b.cssClasses?.includes("double-quote")) {
          toReturn += '"';
        }

        toReturn += b.text;

        if (b.cssClasses?.includes("double-quote")) {
          toReturn += '"';
        }

        if (
          b.cssClasses?.includes("space-after") ||
          b.cssClasses?.includes("space-around")
        ) {
          toReturn += " ";
        }
        break;
      case "block":
      case "container":
        toReturn +=
          `<${b.blockType}${readableClass(b)}>` +
          readableConstants(b.children || []) +
          `</${b.blockType}>`;
        break;
      case "iterator":
        toReturn += `<iterator childGroup="${b.childGroupName}">`;
        break;
    }
  });

  return toReturn;
}
