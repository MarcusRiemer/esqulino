import { Project, ProjectDescription } from './project'
import * as Factory from './helper.spec'

describe('Project', () => {
  it('isBlockLanguageReferenced', () => {
    const p = new Project(Factory.emptyProject({
      projectUsesBlockLanguages: [
        { id: "irrelevant", blockLanguageId: "block_a" }
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

  it('Removing BlockLanguage: Used', () => {
    const p = new Project(Factory.emptyProject({
      projectUsesBlockLanguages: [
        { id: "irrelevant", blockLanguageId: "block_a" }
      ],
      blockLanguages: [
        Factory.emptyBlockLanguage({ id: "block_a", slug: "a", name: "Block A" })
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

    const updateRequest = p.toUpdateRequest();
    expect(updateRequest.projectUsesBlockLanguages).toEqual([{ id: "irrelevant", blockLanguageId: "block_a" }]);
  })

  it('Removing BlockLanguage: Unused', () => {
    const p = new Project(Factory.emptyProject({
      projectUsesBlockLanguages: [
        { id: "irrelevant", blockLanguageId: "block_a" }
      ],
      blockLanguages: [
        Factory.emptyBlockLanguage({ id: "block_a", slug: "a", name: "Block A" }),
        Factory.emptyBlockLanguage({ id: "block_b", slug: "b", name: "Block B" }),
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
    expect(p.isSavingRequired).toBeTruthy();

    const updateRequest = p.toUpdateRequest();
    expect(updateRequest.projectUsesBlockLanguages).toEqual([{ id: "irrelevant", _destroy: true }]);
  })

  it('Removing BlockLanguage: Unknown', () => {
    const p = new Project(Factory.emptyProject({}), undefined);

    expect(p.removeUsedBlockLanguage("block_a")).toBeFalsy();
    expect(p.isSavingRequired).toBeFalsy();

    const updateRequest = p.toUpdateRequest();
    expect(updateRequest.projectUsesBlockLanguages).toEqual([]);
  })
});
