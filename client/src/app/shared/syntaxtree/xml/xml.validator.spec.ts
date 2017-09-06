import * as AST from '../syntaxtree'
import { Validator, ErrorCodes } from '../validator'

import { LANG_DESCRIPTION } from './xml.validator'

describe("Language: XML", () => {
  it("Invalid: Empty ", () => {
    const v = new Validator([LANG_DESCRIPTION]);
    const res = v.validateFromRoot(undefined);

    expect(res.errors.length).toEqual(1);
  });

  it("Invalid: No name for a node ", () => {
    const v = new Validator([LANG_DESCRIPTION]);
    const astDesc: AST.NodeDescription = {
      language: "xml",
      name: "node",
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingProperty);
  });

  it("Invalid: Attribute without key ", () => {
    const v = new Validator([LANG_DESCRIPTION]);
    const astDesc: AST.NodeDescription = {
      language: "xml",
      name: "node",
      children: {
        "attributes": [
          {
            language: "xml",
            name: "attribute",
            properties: {
              "value": "dudewhereismykey?"
            }
          }
        ]
      },
      properties: {
        "name": "xml"
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingProperty);
  });

  it(`Valid: <xml cool="true"></xml>`, () => {
    const v = new Validator([LANG_DESCRIPTION]);
    const astDesc: AST.NodeDescription = {
      language: "xml",
      name: "node",
      children: {
        "attributes": [
          {
            language: "xml",
            name: "attribute",
            properties: {
              "key": "cool",
              "value": "true",
            }
          }
        ]
      },
      properties: {
        "name": "xml"
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.isValid).toBeTruthy();
  });

  it(`Valid: <super><duper></duper></super>`, () => {
    const v = new Validator([LANG_DESCRIPTION]);
    const astDesc: AST.NodeDescription = {
      language: "xml",
      name: "node",
      children: {
        "nodes": [
          {
            language: "xml",
            name: "node",
            properties: {
              "name": "duper"
            }
          }
        ]
      },
      properties: {
        "name": "super"
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.isValid).toBeTruthy();
  });
});
