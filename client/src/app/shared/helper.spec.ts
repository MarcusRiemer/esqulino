import { ProjectFullDescription } from "./project";
import { BlockLanguageDescription } from "./block/block-language.description";

/**
 * Return a valid description of an empty project. Individual parts of
 * the description may be overridden.
 *
 * @param override A partial project that overrides the default description.
 * @return A schematically correct description of a project.
 */
export function emptyProject(
  override: Partial<ProjectFullDescription>
): ProjectFullDescription {
  const defaultDescription: ProjectFullDescription = {
    id: "test",
    slug: "test",
    name: { en: "Test" },
    description: { en: "Dynamically created for client side specs" },
    public: true,
    projectUsesBlockLanguages: [],
    defaultDatabase: {
      id: "spec",
      name: "specDb",
    },
    blockLanguages: [],
    grammars: [],
    codeResources: [],
    schema: [],
    projectSources: [],
  };

  return Object.assign(defaultDescription, override);
}

/**
 * Return a valid description of an empty project. Individual parts of
 * the description may be overridden.
 *
 * @param override A partial project that overrides the default description.
 * @return A schematically correct description of a project.
 */
export function emptyBlockLanguage(
  override: Partial<BlockLanguageDescription>
): BlockLanguageDescription {
  const defaultDescription: BlockLanguageDescription = {
    id: "test",
    slug: "test",
    rootCssClasses: [],
    defaultProgrammingLanguageId: "test",
    name: "Empty BlockLanguage",
    editorBlocks: [],
    editorComponents: [],
    sidebars: [],
    createdAt: "",
    updatedAt: "",
  };

  return Object.assign(defaultDescription, override);
}
