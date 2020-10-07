import { Project } from "./project";
import * as Factory from "./helper.spec";

describe("Project", () => {
  it("isBlockLanguageReferenced", () => {
    const p = new Project(
      Factory.emptyProject({
        projectUsesBlockLanguages: [
          { id: "irrelevant", blockLanguageId: "block_a" },
        ],
        codeResources: [
          {
            id: "foo",
            blockLanguageId: "block_a",
            name: "Foo",
            programmingLanguageId: "prog_a",
          },
        ],
      }),
      undefined
    );
    expect(p.isBlockLanguageReferenced("block_a")).toBeTruthy(
      "BlockLanguage is referenced"
    );
    expect(p.isBlockLanguageReferenced("block_b")).toBeFalsy(
      "BlockLanguage is not referenced"
    );
  });
});
