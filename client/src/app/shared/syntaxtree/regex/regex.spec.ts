import * as AST from '../syntaxtree'
import { Validator, ErrorCodes } from '../validator'

import { VALIDATOR_DESCRIPTION } from './regex.validator'

describe("Language: Regex (Validation)", () => {
  it("Invalid: Empty Regex", () => {
    const v = new Validator([VALIDATOR_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "regex",
      name: "expr",
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.InvalidMinOccurences);
  });
});
