import { renderTree } from "./render";
import { NodeDescription } from '../syntaxtree.description';

describe("Web (HTML Rendering)", () => {
  it("renders the empty document", () => {
    const res = renderTree({
      frontMatter: {
        "a": 12
      }
    });
    expect(res).toEqual("<html></html>");
  });
});