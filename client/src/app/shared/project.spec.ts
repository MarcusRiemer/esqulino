import { Project, ProjectDescription } from './project'
import { CURRENT_API_VERSION } from './resource.description'

/**
 * Return a valid description of an empty project. Individual parts of
 * the description may be overridden.
 *
 * @param override A partial project that overrides the default description.
 * @return A schematically correct description of a project.
 */
function emptyProjectDescription(override: Partial<ProjectDescription>): ProjectDescription {
  const defaultDescription: ProjectDescription = {
    id: "test1",
    slug: "test1",
    name: "Test 1",
    description: "Dynamically created for client side specs",
    public: true,
    usesBlockLanguages: [],
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

describe('Project', () => {
  it('isBlockLanguageReferenced', () => {
    const p = new Project(emptyProjectDescription({
      usesBlockLanguages: [
        { blockLanguageId: "block_a" }
      ],
      codeResources: [
        {
          id: "foo",
          blockLanguageId: "block_a",
          name: "Foo",
          programmingLanguageId: "prog_a"
        }
      ]
    }), undefined);

    expect(p.isBlockLanguageReferenced("block_a")).toBeTruthy("BlockLanguage is referenced");
    expect(p.isBlockLanguageReferenced("block_b")).toBeFalsy("BlockLanguage is not referenced");
  })

  it('removeUsedBlockLanguage: Used', () => {
    const p = new Project(emptyProjectDescription({
      usesBlockLanguages: [
        { blockLanguageId: "block_a" }
      ],
      blockLanguages: [
        { id: "block_a", slug: "a", name: "Block A", sidebars: [], editorBlocks: [] }
      ],
      codeResources: [
        {
          id: "foo",
          blockLanguageId: "block_a",
          name: "Foo",
          programmingLanguageId: "prog_a"
        }
      ]
    }), undefined);

    expect(p.removeUsedBlockLanguage("block_a")).toBeFalsy();
  })

  it('removeUsedBlockLanguage: Unused', () => {
    const p = new Project(emptyProjectDescription({
      usesBlockLanguages: [
        { blockLanguageId: "block_a" }
      ],
      blockLanguages: [
        { id: "block_a", slug: "a", name: "Block A", sidebars: [], editorBlocks: [] },
        { id: "block_b", slug: "b", name: "Block B", sidebars: [], editorBlocks: [] }
      ],
      codeResources: [
        {
          id: "foo",
          blockLanguageId: "block_b",
          name: "Foo",
          programmingLanguageId: "prog_a"
        }
      ]
    }), undefined);

    expect(p.removeUsedBlockLanguage("block_a")).toBeTruthy();
    expect(p.getBlockLanguage("block_a")).toBeFalsy();
    expect(p.isSavingRequired).toBeTruthy();
  })
});
