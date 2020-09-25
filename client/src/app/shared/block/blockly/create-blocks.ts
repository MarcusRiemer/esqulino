import {
  GrammarDocument,
  isVisualizableType,
  NamedLanguages,
  isGrammarDocument,
  NodeAttributeDescription,
  NodeStringTypeRestrictions,
  EnumRestrictionDescription,
  Orientation,
  NodeTypesChildReference,
  QualifiedTypeName,
  typenameEquals,
} from "../../syntaxtree/";

import { BlocklyBlock, BlockArgs } from "./blockly-types";
import {
  allPresentTypes,
  getQualifiedTypes,
  QualifiedNodeTypeDescription,
  stableQualifiedTypename,
  resolveNodeTypeChildReference,
} from "../../syntaxtree/grammar-type-util";

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
 * Blockly requires a single, definitive description for each and every
 * block. But the layout of those blocks depends on the context in which
 * they are used.
 */
export type AppearanceContext = {
  [typename: string]: {
    orientation: Set<Orientation>;
  };
};

/**
 * This function takes a look at all contexts that exist
 * for a certain set of types and gathers information that might be relevant
 * for block layout decisions.
 */
export function buildAppearanceContext(
  types: QualifiedNodeTypeDescription[]
): AppearanceContext {
  const toReturn: AppearanceContext = {};

  // When a type references a typedef, all those "typedefed" types
  // appear in that context.
  const typedefs: { [typename: string]: QualifiedTypeName[] } = {};
  types.forEach((t) => {
    if (t.type === "oneOf") {
      t.oneOf.forEach((ref) => {
        const resolvedRef = resolveNodeTypeChildReference(ref, t.languageName);
        const strRef = stableQualifiedTypename(t);
        if (!typedefs[strRef]) {
          typedefs[strRef] = [];
        }
        typedefs[strRef].push(resolvedRef);
      });
    }
  });

  // The given type was seen in the given context
  const addAppearance = (
    _from: NodeAttributeDescription,
    ref: NodeTypesChildReference,
    o: Orientation,
    languageName: string
  ) => {
    const targetTypeRef = resolveNodeTypeChildReference(ref, languageName);
    const targetTypeDesc = types.find((rhs) =>
      typenameEquals(targetTypeRef, rhs)
    );

    const affected: QualifiedTypeName[] = [];

    // If we have a concrete type, it is immediatly affected
    if (
      targetTypeDesc.type === "concrete" ||
      targetTypeDesc.type === "visualize"
    ) {
      affected.push(targetTypeRef);
    }
    // A type reference on the other hand needs to be resolved
    else {
      affected.push(
        ...(typedefs[stableQualifiedTypename(targetTypeRef)] ?? [])
      );
    }

    affected.forEach((affectedType) => {
      const stringRef = stableQualifiedTypename(affectedType);
      if (affectedType.typeName === "columnName" && o === "vertical") {
        debugger;
      }
      if (!toReturn[stringRef]) {
        toReturn[stringRef] = { orientation: new Set() };
      }
      toReturn[stringRef].orientation.add(o);
    });
  };

  const walkAttributes = (
    attributes: NodeAttributeDescription[],
    orientation: Orientation,
    languageName: string
  ) => {
    attributes.forEach((a) => {
      switch (a.type) {
        case "allowed":
        case "sequence":
          a.nodeTypes.forEach((ref) =>
            addAppearance(a, ref, orientation, languageName)
          );
          break;
        case "container":
          walkAttributes(a.children, a.orientation, languageName);
          break;
      }
    });
  };

  types.forEach((t) => {
    if (isVisualizableType(t)) {
      walkAttributes(t.attributes, "horizontal", t.languageName);
    }
  });

  return toReturn;
}

function blockOrientation(
  t: QualifiedTypeName,
  ac: AppearanceContext
): Orientation {
  const str = stableQualifiedTypename(t);
  const singleContext = ac[str];
  if (!singleContext || singleContext.orientation.has("vertical")) {
    return "vertical";
  } else if (singleContext.orientation.has("horizontal")) {
    return "horizontal";
  }
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
export function createBlocksFromGrammar(
  g: NamedLanguages | GrammarDocument
): BlocklyBlock[] {
  const types = getQualifiedTypes(
    isGrammarDocument(g) ? allPresentTypes(g) : g
  );
  const appearanceContext = buildAppearanceContext(types);
  const invalidAppearances = Object.entries(appearanceContext)
    .filter(([_t, ac]) => ac.orientation.size > 1)
    .map(([t, ac]) => {
      return {
        t,
        orientations: Array.from(ac.orientation),
      };
    });
  if (invalidAppearances.length > 0) {
    throw new Error(
      `Invalid appearances for ${JSON.stringify(invalidAppearances)}`
    );
  }

  const toReturn: BlocklyBlock[] = [];

  types.forEach(
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
      const continuation = blockContinuation(t, appearanceContext);
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
          blockConnectors(t, appearanceContext)
        )
      );
    }
  );

  return toReturn;
}
