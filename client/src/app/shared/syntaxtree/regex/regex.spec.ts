import { CodeGenerator } from "../codegenerator";
import { Node, NodeDescription } from "../syntaxtree";
import { Validator } from "../validator";
import { ErrorCodes } from "../validation-result";

import { NODE_CONVERTER } from "./regex.codegenerator";
import { GRAMMAR_DESCRIPTION } from "./regex.grammar";

// TODO verwerfen und neu machen
describe("Language: RegEx", () => {
  it("Invalid: Empty RegEx", () => {
    const astDesc: NodeDescription = {
      language: "regex",
      name: "root",
    };

    const ast = new Node(astDesc, undefined);

    const v = new Validator([GRAMMAR_DESCRIPTION]);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.InvalidMinOccurences);
  });

  it('RegEx: "a"', () => {
    const astDesc: NodeDescription = {
      language: "regex",
      name: "root",
      children: {
        expressions: [
          {
            language: "regex",
            name: "expr",
            children: {
              singleExpression: [
                {
                  language: "regex",
                  name: "constant",
                  properties: {
                    value: "a",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const v = new Validator([GRAMMAR_DESCRIPTION]);
    const res = v.validateFromRoot(ast);
    expect(res.isValid).toBeTruthy();

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const emitted = codeGen.emit(ast);
    expect(emitted).toEqual("a");
  });

  it('RegEx: "(a)"', () => {
    const astDesc: NodeDescription = {
      language: "regex",
      name: "root",
      children: {
        expressions: [
          {
            language: "regex",
            name: "expr",
            children: {
              singleExpression: [
                {
                  language: "regex",
                  name: "alternative",
                  children: {
                    expressions: [
                      {
                        language: "regex",
                        name: "expr",
                        children: {
                          singleExpression: [
                            {
                              language: "regex",
                              name: "constant",
                              properties: {
                                value: "a",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const v = new Validator([GRAMMAR_DESCRIPTION]);
    const res = v.validateFromRoot(ast);
    expect(res.errors).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const emitted = codeGen.emit(ast);

    expect(emitted).toEqual("(a)");
  });

  it('RegEx: "(a|(b|c))"', () => {
    const astDesc: NodeDescription = {
      language: "regex",
      name: "root",
      children: {
        expressions: [
          {
            language: "regex",
            name: "expr",
            children: {
              singleExpression: [
                {
                  language: "regex",
                  name: "alternative",
                  children: {
                    expressions: [
                      {
                        language: "regex",
                        name: "expr",
                        children: {
                          singleExpression: [
                            {
                              language: "regex",
                              name: "constant",
                              properties: {
                                value: "a",
                              },
                            },
                          ],
                        },
                      },
                      {
                        language: "regex",
                        name: "expr",
                        children: {
                          singleExpression: [
                            {
                              language: "regex",
                              name: "alternative",
                              children: {
                                expressions: [
                                  {
                                    language: "regex",
                                    name: "expr",
                                    children: {
                                      singleExpression: [
                                        {
                                          language: "regex",
                                          name: "constant",
                                          properties: {
                                            value: "b",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                  {
                                    language: "regex",
                                    name: "expr",
                                    children: {
                                      singleExpression: [
                                        {
                                          language: "regex",
                                          name: "constant",
                                          properties: {
                                            value: "c",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const v = new Validator([GRAMMAR_DESCRIPTION]);
    const res = v.validateFromRoot(ast);
    expect(res.isValid).toBeTruthy();

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const emitted = codeGen.emit(ast);

    expect(emitted).toEqual("(a|(b|c))");
  });

  it('RegEx: "a(b|c)d"', () => {
    const astDesc: NodeDescription = {
      language: "regex",
      name: "root",
      children: {
        expressions: [
          {
            language: "regex",
            name: "expr",
            children: {
              singleExpression: [
                {
                  language: "regex",
                  name: "constant",
                  properties: {
                    value: "a",
                  },
                },
              ],
            },
          },
          {
            language: "regex",
            name: "expr",
            children: {
              singleExpression: [
                {
                  language: "regex",
                  name: "alternative",
                  children: {
                    expressions: [
                      {
                        language: "regex",
                        name: "expr",
                        children: {
                          singleExpression: [
                            {
                              language: "regex",
                              name: "constant",
                              properties: {
                                value: "b",
                              },
                            },
                          ],
                        },
                      },
                      {
                        language: "regex",
                        name: "expr",
                        children: {
                          singleExpression: [
                            {
                              language: "regex",
                              name: "constant",
                              properties: {
                                value: "c",
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            language: "regex",
            name: "expr",
            children: {
              singleExpression: [
                {
                  language: "regex",
                  name: "constant",
                  properties: {
                    value: "d",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const v = new Validator([GRAMMAR_DESCRIPTION]);
    const res = v.validateFromRoot(ast);

    expect(res.isValid).toBeTruthy();

    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const emitted = codeGen.emit(ast);

    expect(emitted).toEqual("a(b|c)d");
  });
});
