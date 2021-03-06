import {
  NodeDescription,
  NodeAttributeDescription,
  NodePropertyTypeDescription,
  NodeChildrenGroupDescription,
  NamedLanguages,
  VisualisedLanguages,
  EnumRestrictionDescription,
  NodeVisualContainerDescription,
} from "../../syntaxtree/";
import { FullNodeConcreteTypeDescription } from "../../syntaxtree/grammar-type-util.description";
import { fullNodeDescription } from "../../syntaxtree/grammar-type-util";
import {
  SidebarDescription,
  SidebarBlockDescription,
  FixedBlocksSidebarCategoryDescription,
  FixedBlocksSidebarDescription,
} from "../block.description";
import {
  AnySidebarDescription,
  AnySidebarBlockDescription,
  ConstantSidebarBlockDescription,
  AnySidebarCategoryDescription,
  ConstantBlocksSidebarCategoryDescription,
  MixedBlocksSidebarCategoryDescription,
  GeneratedBlocksSidebarDescription,
} from "./sidebar.description";

// These values for "type" refer to a child group
const CHILD_GROUP_TYPES = new Set<NodeAttributeDescription["type"]>([
  "sequence",
  "allowed",
  "choice",
]);

/**
 * Calculates a default value that has at least a type that matches the given type.
 * This value will hopefully satisfy the type, but further restrictions may hinder
 * this.
 */
export function generateDefaultValue(
  propertyType: NodePropertyTypeDescription
) {
  switch (propertyType.base) {
    case "boolean":
      return "false";
    case "integer":
      return "0";
    case "string":
      const enumRestriction = propertyType.restrictions?.find(
        (restr): restr is EnumRestrictionDescription => restr.type === "enum"
      );
      if (enumRestriction) {
        return enumRestriction.value[0] ?? "";
      } else {
        return "";
      }
  }
}

/**
 * A wild guess to create a meaningful default node if only the type
 * of a node is given.
 */
export function generateDefaultNode(
  nodeType: FullNodeConcreteTypeDescription
): NodeDescription {
  // Minimal requirement: Referenced type
  const toReturn: NodeDescription = {
    name: nodeType.typeName,
    language: nodeType.languageName,
  };

  const impl = (attributes: NodeAttributeDescription[]) => {
    // Are there any containers? These must be walked recursively
    const containers = attributes.filter(
      (a): a is NodeVisualContainerDescription => a.type === "container"
    );
    containers.forEach((c) => impl(c.children));

    // Are there any child categories that are required? For the moment
    // we simply assume that a mentioned group is also required
    const requiredChildrenCategories = attributes.filter(
      (a): a is NodeChildrenGroupDescription => CHILD_GROUP_TYPES.has(a.type)
    );

    if (requiredChildrenCategories.length > 0) {
      toReturn.children = {};
      requiredChildrenCategories.forEach((childCategory) => {
        toReturn.children[childCategory.name] = [];
      });
    }

    // Assign default values for properties
    const properties = attributes.filter(
      (a): a is NodePropertyTypeDescription => a.type === "property"
    );

    if (properties.length > 0) {
      toReturn.properties = {};
      properties.forEach((p) => {
        toReturn.properties[p.name] = generateDefaultValue(p);
      });
    }
  };
  impl(nodeType?.attributes ?? []);

  return toReturn;
}

/**
 * Generates a concrete block that is draggable and shal be shown on its own.
 */
export function generateSidebarBlock(
  languages: NamedLanguages | VisualisedLanguages,
  block: AnySidebarBlockDescription
): SidebarBlockDescription {
  if (block.type === "constant") {
    // Ensure that there is no superflous "type" property on the description
    // that we return.
    const toReturn: ConstantSidebarBlockDescription = JSON.parse(
      JSON.stringify(block)
    );
    delete toReturn.type;
    return toReturn;
  } else {
    const nodeType = fullNodeDescription(languages, block.nodeType);
    const toReturn: SidebarBlockDescription = {
      displayName: block.displayName || block.nodeType.typeName,
      defaultNode: generateDefaultNode(nodeType),
    };

    return toReturn;
  }
}

/**
 * Generates all blocks in this sidebar category.
 */
export function generateSidebarCategory(
  languages: NamedLanguages | VisualisedLanguages,
  category: AnySidebarCategoryDescription
): FixedBlocksSidebarCategoryDescription {
  switch (category.type) {
    case "constant": {
      // Ensure that there is no superflous "type" property on the description
      // that we return.
      const toReturn: ConstantBlocksSidebarCategoryDescription = JSON.parse(
        JSON.stringify(category)
      );
      delete toReturn.type;
      return toReturn;
    }
    case "mixed": {
      // Generate relevant blocks
      const toReturn: FixedBlocksSidebarCategoryDescription = {
        categoryCaption: category.categoryCaption,
        blocks: category.blocks.map((b) => generateSidebarBlock(languages, b)),
      };

      return toReturn;
    }
    case "generated": {
      // Generate the relevant description, we simply treat this
      // as a mixed description that only contains generated blocks
      const toGenerate: MixedBlocksSidebarCategoryDescription = {
        type: "mixed",
        categoryCaption: category.categoryCaption,
        blocks: [],
      };

      // "Translate" every type that has been mentioned
      Object.entries(category.grammar).forEach(([grammarName, typeNames]) => {
        typeNames.forEach((typeName) => {
          toGenerate.blocks.push({
            type: "generated",
            nodeType: {
              languageName: grammarName,
              typeName: typeName,
            },
          });
        });
      });

      return generateSidebarCategory(languages, toGenerate);
    }
  }
}

/**
 * Takes the given sidebar and ensures that it only contains static
 * information.
 */
export function generateSidebar(
  languages: NamedLanguages | VisualisedLanguages,
  desc: GeneratedBlocksSidebarDescription
): FixedBlocksSidebarDescription;
export function generateSidebar(
  languages: NamedLanguages | VisualisedLanguages,
  desc: AnySidebarDescription
): SidebarDescription;
export function generateSidebar(
  languages: NamedLanguages | VisualisedLanguages,
  desc: AnySidebarDescription
): SidebarDescription {
  // Is there anything to generate?
  if (desc.type === "generatedBlocks") {
    return {
      type: "fixedBlocks",
      caption: desc.caption,
      categories: desc.categories.map((category) =>
        generateSidebarCategory(languages, category)
      ),
    };
  } else {
    // No, just return the sidebar as it is.
    return desc;
  }
}
