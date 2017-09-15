import * as AST from '../syntaxtree'
import { Validator, ErrorCodes } from '../validator'

import { LANG_DESCRIPTION } from './sql.validator'

describe("Language: SQL (Validation)", () => {
  it("Invalid: Empty ", () => {
    const v = new Validator([LANG_DESCRIPTION]);

    const astDesc: AST.NodeDescription = {
      language: "sql",
      name: "querySelect",
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
  });
});
