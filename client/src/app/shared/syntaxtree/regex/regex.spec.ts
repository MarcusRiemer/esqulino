import { CodeGenerator } from "../codegenerator";
import { Node, NodeDescription } from "../syntaxtree";
import { Validator } from "../validator";
import { ErrorCodes } from "../validation-result";

import { REGEX_CONVERTER } from "./regex.codegenerator";
import { GRAMMAR_DESCRIPTION } from "./regex.grammar";

describe("Language: RegEx", () => {
  it("Invalid: Empty RegEx", () => {
    const astDesc: NodeDescription = {
      language: "regex",
      name: "expression",
    };

    const ast = new Node(astDesc, undefined);

    const v = new Validator([GRAMMAR_DESCRIPTION]);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
  });

  it('RegEx: "a"', () => {
    const astDesc: NodeDescription = {
      language: "regex",
      name: "expression",
      children: {
        subexpressions: [
          {
            language: "regex",
            name: "characters",
            properties: {
              chars: "a",
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const v = new Validator([GRAMMAR_DESCRIPTION]);
    const res = v.validateFromRoot(ast);

    expect(res.errors).withContext("language must be valid").toEqual([]);

    const codeGen = new CodeGenerator(REGEX_CONVERTER);
    const emitted = codeGen.emit(ast);
    expect(emitted).toEqual("a");
  });
});
