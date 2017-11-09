import { CodeGenerator, NodeConverterRegistration, CodeGeneratorProcess } from '../codegenerator'
import { Node, NodeDescription } from '../syntaxtree'
import { Validator, ErrorCodes } from '../validator'

import { NODE_CONVERTER } from './dxml.codegenerator'
import { VALIDATOR_DESCRIPTION } from './dxml.validator'

describe("Language: Dynamic XML (Validation)", () => {
  it(`<root></root>`, () => {
    const v = new Validator([VALIDATOR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        "name": "root"
      }
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);
    expect(result).toEqual(`<root></root>`);
  });

  it(`<root key="value"></root>`, () => {
    const v = new Validator([VALIDATOR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        "name": "root"
      },
      children: {
        "attributes": [
          {
            language: "dxml",
            name: "attribute",
            children: {
              "value": [
                {
                  language: "dxml",
                  name: "text",
                  properties: {
                    "value": "value"
                  }
                }
              ]
            },
            properties: {
              name: "key"
            }
          }
        ]
      },
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);
    expect(result).toEqual(`<root key="value"></root>`);
  });

  it(`<root key="<%= varName %>"></root>`, () => {
    const v = new Validator([VALIDATOR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        "name": "root"
      },
      children: {
        "attributes": [
          {
            language: "dxml",
            name: "attribute",
            children: {
              "value": [
                {
                  language: "dxml",
                  name: "interpolate",
                  children: {
                    "expr": [
                      {
                        language: "dxml",
                        name: "expr",
                        children: {
                          "concreteExpr": [
                            {
                              language: "dxml",
                              name: "exprVar",
                              properties: {
                                "name": "varName"
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            },
            properties: {
              name: "key"
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);
    expect(result).toEqual(`<root key="<%= varName %>"></root>`);
  });

  it(`<root key="const-<%= varName %>"></root>`, () => {
    const v = new Validator([VALIDATOR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        "name": "root"
      },
      children: {
        "attributes": [
          {
            language: "dxml",
            name: "attribute",
            children: {
              "value": [
                {
                  language: "dxml",
                  name: "text",
                  properties: {
                    "value": "const-"
                  }
                },
                {
                  language: "dxml",
                  name: "interpolate",
                  children: {
                    "expr": [
                      {
                        language: "dxml",
                        name: "expr",
                        children: {
                          "concreteExpr": [
                            {
                              language: "dxml",
                              name: "exprVar",
                              properties: {
                                "name": "varName"
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            },
            properties: {
              name: "key"
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);
    expect(result).toEqual(`<root key="const-<%= varName %>"></root>`);
  });

  it(`<root>Root-Text</root>`, () => {
    const v = new Validator([VALIDATOR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        "name": "root"
      },
      children: {
        "elements": [
          {
            language: "dxml",
            name: "text",
            properties: {
              "value": "Root-Text"
            }
          }
        ]
      }
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);
    expect(result).toEqual(`<root>\nRoot-Text\n</root>`);
  });
});
