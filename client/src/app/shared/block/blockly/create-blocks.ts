import {
  GrammarDocument,
  isVisualizableType,
  NodeAttributeDescription,
  NodeStringTypeRestrictions,
  EnumRestrictionDescription,
  Orientation,
  QualifiedTypeName,
} from "../../syntaxtree/";

import { BlocklyBlock, BlockArgs } from "./blockly-types";
import { allPresentTypes } from "../../syntaxtree/grammar-type-util";

import {
  AppearanceContext,
  blockOrientation,
  buildAppearanceContext,
} from "./appearance-context";

function anyTag(a: NodeAttributeDescription, ...tag: string[]) {
  if (!a.tags) {
    return false;
  } else {
    return tag.some((t) => a.tags.includes(t));
  }
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getEnumRestriction(
  r: NodeStringTypeRestrictions[]
): EnumRestrictionDescription | undefined {
  return r && r.find((r): r is EnumRestrictionDescription => r.type === "enum");
}

/**
 * Checks the appearance context for the given type and returns
 * matching instructions
 */
function blockConnectors(
  t: QualifiedTypeName,
  ac: AppearanceContext
):
  | Pick<BlocklyBlock, "previousStatement" | "nextStatement">
  | Pick<BlocklyBlock, "output"> {
  if (blockOrientation(t, ac) === "vertical") {
    return { previousStatement: null, nextStatement: null };
  } else {
    return { output: null };
  }
}

/**
 * Blocks that are used horizontally need to offer a way for other blocks
 * to go "behind" them.
 */
function blockContinuation(
  t: QualifiedTypeName,
  ac: AppearanceContext
): BlockArgs | undefined {
  if (blockOrientation(t, ac) === "horizontal") {
    return { type: "input_value", name: "__list__" };
  }
}

/**
 * Generates JSON Blockly definitions from a grammar.
 */
export function createBlocksFromGrammar(g: GrammarDocument): BlocklyBlock[] {
  const ac = buildAppearanceContext(allPresentTypes(g));

  const toReturn: BlocklyBlock[] = [];

  ac.qualifiedTypes.forEach(
    (t): BlocklyBlock => {
      if (!isVisualizableType(t)) {
        return;
      }

      const args: BlockArgs[] = [];
      let messageString = "";
      let messagePlaceholderIndex = 1;

      // Bad stateful function that adds something to the message buffer
      const addPlaceholder = (before?: string) => {
        if (before !== undefined) {
          messageString += before;
        }
        messageString += "%" + messagePlaceholderIndex;
        messagePlaceholderIndex++;
      };

      const walkAttributes = (
        attributes: NodeAttributeDescription[],
        orientation: Orientation
      ) => {
        const multipleChildgroups =
          attributes.filter((a) => Object.keys(a).includes("children")).length >
          1;

        attributes.forEach((attr) => {
          switch (attr.type) {
            case "container":
              walkAttributes(attr.children, attr.orientation);
              break;
            case "allowed":
            case "sequence":
            case "parentheses":
            case "choice":
              args.push({
                type:
                  orientation === "vertical"
                    ? "input_statement"
                    : "input_value",
                name: attr.name,
              });
              // Possibly prepend the name of the childgroup
              addPlaceholder(multipleChildgroups ? attr.name : undefined);
              break;
            case "property":
              switch (attr.base) {
                case "string":
                  const enumRestriction = getEnumRestriction(attr.restrictions);
                  if (enumRestriction) {
                    args.push({
                      type: "field_dropdown",
                      name: attr.name,
                      options: enumRestriction.value.map((v) => [v, v]),
                    });
                  } else {
                    args.push({
                      name: attr.name,
                      type: "field_input",
                    });
                  }
                  addPlaceholder();
                  break;
                case "integer":
                  args.push({
                    name: attr.name,
                    type: "field_number",
                  });
                  addPlaceholder();
                  break;
                case "boolean":
                  args.push({
                    name: attr.name,
                    type: "field_checkbox",
                  });
                  addPlaceholder();
                  break;
                default:
                  messageString += "<<" + attr.name + ":" + attr.base + ">> ";
              }
              break;
            case "terminal":
              if (anyTag(attr, "space-before", "space-around")) {
                messageString += " ";
              }
              messageString += attr.symbol;
              if (anyTag(attr, "space-after", "space-around")) {
                messageString += " ";
              }
          }
        });
      };
      walkAttributes(t.attributes, "horizontal");

      // Possibly add a possibility to append something at the right of this block
      const continuation = blockContinuation(t, ac);
      if (continuation) {
        args.push(continuation);
        addPlaceholder();
      }

      toReturn.push(
        Object.assign(
          {},
          {
            type: t.languageName + "." + t.typeName,
            colour: getRandomInt(360),
            message0: messageString || t.languageName + "." + t.typeName,
            args0: args,
            tooltip: t.languageName + "." + t.typeName,
          },
          blockConnectors(t, ac)
        )
      );
    }
  );

  return toReturn;
}
