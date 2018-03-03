import { Project, ProjectDescription } from './project'
import { BlockLanguageDescription } from './block/block-language.description'
import { CURRENT_API_VERSION } from './resource.description'

/**
 * Return a valid description of an empty project. Individual parts of
 * the description may be overridden.
 *
 * @param override A partial project that overrides the default description.
 * @return A schematically correct description of a project.
 */
export function emptyProject(override: Partial<ProjectDescription>): ProjectDescription {
  const defaultDescription: ProjectDescription = {
    id: "test",
    slug: "test",
    name: "Test",
    description: "Dynamically created for client side specs",
    public: true,
    projectUsesBlockLanguages: [],
    activeDatabase: "default",
    apiVersion: CURRENT_API_VERSION,
    availableDatabases: {},
    blockLanguages: [],
    codeResources: [],
    schema: [],
    sources: [],
  };

  return (Object.assign(defaultDescription, override));
}

/**
 * Return a valid description of an empty project. Individual parts of
 * the description may be overridden.
 *
 * @param override A partial project that overrides the default description.
 * @return A schematically correct description of a project.
 */
export function emptyBlockLanguage(override: Partial<BlockLanguageDescription>): BlockLanguageDescription {
  const defaultDescription: BlockLanguageDescription = {
    id: "test",
    slug: "test",
    defaultProgrammingLanguageId: "test",
    name: "Empty BlockLanguage",
    editorBlocks: [],
    editorComponents: [],
    sidebars: [],
    createdAt: "",
    updatedAt: "",
  };

  return (Object.assign(defaultDescription, override));
}
