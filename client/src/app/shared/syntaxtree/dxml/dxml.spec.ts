import { CodeGenerator } from "../codegenerator";
import { Tree, Node, NodeDescription } from "../syntaxtree";
import { Validator } from "../validator";
import { printableError } from "../validation-result";

import {
  NODE_CONVERTER_ERUBY,
  NODE_CONVERTER_LIQUID,
} from "./dxml.codegenerator";
import { GRAMMAR_DESCRIPTION } from "./dxml.grammar";

function parseDom(input: string) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(input, "text/xml");

  // Find out whether the input was valid, sadly, this is horrible ...
  // See:
  //
  // How do I detect XML parsing errors when using
  // Javascript's DOMParser in a cross-browser way?
  // https://stackoverflow.com/questions/11563554/
  const errors = dom.getElementsByTagName("parsererror");
  expect(errors.length).toEqual(0, "Number of errors in document");

  return dom;
}

describe("Language: Dynamic XML (eruby & liquid)", () => {
  it(`<root></root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.map(printableError)).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
    const result = codeGen.emit(ast);
    expect(result).toEqual(`<root></root>`);

    const dom = parseDom(result);
    expect(dom.documentElement.localName).toEqual(astDesc.properties["name"]);
  });

  it(`<root key="value"></root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
      children: {
        attributes: [
          {
            language: "dxml",
            name: "attribute",
            children: {
              value: [
                {
                  language: "dxml",
                  name: "text",
                  properties: {
                    value: "value",
                  },
                },
              ],
            },
            properties: {
              name: "key",
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.map(printableError)).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
    const result = codeGen.emit(ast);
    expect(result).toEqual(`<root key="value"></root>`);

    const dom = parseDom(result);
    const root = dom.documentElement;
    expect(root.localName).toEqual(astDesc.properties["name"]);
    expect(root.attributes[0].localName).toEqual(
      astDesc.children["attributes"][0].properties["name"]
    );
  });

  it(`<root key="<%= varName %>"></root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
      children: {
        attributes: [
          {
            language: "dxml",
            name: "attribute",
            children: {
              value: [
                {
                  language: "dxml",
                  name: "interpolate",
                  children: {
                    expr: [
                      {
                        language: "dxml",
                        name: "exprVar",
                        properties: {
                          name: "varName",
                        },
                      },
                    ],
                  },
                },
              ],
            },
            properties: {
              name: "key",
            },
          },
        ],
      },
    };

    const ast = new Tree(astDesc);
    const res = v.validateFromRoot(ast);

    expect(res.errors.map(printableError)).toEqual([]);

    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
      const result = codeGen.emit(ast);
      expect(result).toEqual(`<root key="<%= varName %>"></root>`);
    }

    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_LIQUID);
      const result = codeGen.emit(ast);
      expect(result).toEqual(`<root key="{{ varName }}"></root>`);
    }
  });

  it(`<root key="const-<%= varName %>"></root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
      children: {
        attributes: [
          {
            language: "dxml",
            name: "attribute",
            children: {
              value: [
                {
                  language: "dxml",
                  name: "text",
                  properties: {
                    value: "const-",
                  },
                },
                {
                  language: "dxml",
                  name: "interpolate",
                  children: {
                    expr: [
                      {
                        language: "dxml",
                        name: "exprVar",
                        properties: {
                          name: "varName",
                        },
                      },
                    ],
                  },
                },
              ],
            },
            properties: {
              name: "key",
            },
          },
        ],
      },
    };

    const ast = new Tree(astDesc);

    const res = v.validateFromRoot(ast);
    expect(res.errors.map(printableError)).toEqual([]);

    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
      const result = codeGen.emit(ast);
      expect(result).toEqual(`<root key="const-<%= varName %>"></root>`);
    }
    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_LIQUID);
      const result = codeGen.emit(ast);
      expect(result).toEqual(`<root key="const-{{ varName }}"></root>`);
    }
  });

  it(`<root>Root-Text</root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
      children: {
        elements: [
          {
            language: "dxml",
            name: "text",
            properties: {
              value: "Root-Text",
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.map(printableError)).toEqual([]);

    const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
    const result = codeGen.emit(ast);
    expect(result).toEqual(`<root>\n  Root-Text\n</root>`);

    const dom = parseDom(result);
    expect(dom.documentElement.localName).toEqual(astDesc.properties["name"]);
    expect(dom.documentElement.textContent).toEqual("\n  Root-Text\n");
  });

  it(`<root><%= var_name %></root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
      children: {
        elements: [
          {
            language: "dxml",
            name: "interpolate",
            children: {
              expr: [
                {
                  language: "dxml",
                  name: "exprVar",
                  properties: {
                    name: "var_name",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.map(printableError)).toEqual([]);

    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
      const result = codeGen.emit(ast);
      expect(result).toEqual(`<root>\n  <%= var_name %>\n</root>`);
    }
    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_LIQUID);
      const result = codeGen.emit(ast);
      expect(result).toEqual(`<root>\n  {{ var_name }}\n</root>`);
    }
  });

  it(`<root><% if var_name %>Root-Text<% end %></root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
      children: {
        elements: [
          {
            language: "dxml",
            name: "if",
            children: {
              condition: [
                {
                  language: "dxml",
                  name: "exprVar",
                  properties: {
                    name: "var_name",
                  },
                },
              ],
              body: [
                {
                  language: "dxml",
                  name: "text",
                  properties: {
                    value: "Root-Text",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.map(printableError)).toEqual([]);

    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
      const result = codeGen.emit(ast);
      expect(result).toEqual(
        `<root>\n  <% if var_name %>\n  Root-Text\n  <% end %>\n</root>`
      );
    }
    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_LIQUID);
      const result = codeGen.emit(ast);
      expect(result).toEqual(
        `<root>\n  {% if var_name %}\n  Root-Text\n  {% end %}\n</root>`
      );
    }
  });

  it(`<root><% if var_name %><c1></c1><c2></c2><% end %></root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
      children: {
        elements: [
          {
            language: "dxml",
            name: "if",
            children: {
              condition: [
                {
                  language: "dxml",
                  name: "exprVar",
                  properties: {
                    name: "var_name",
                  },
                },
              ],
              body: [
                {
                  language: "dxml",
                  name: "element",
                  properties: {
                    name: "c1",
                  },
                },
                {
                  language: "dxml",
                  name: "element",
                  properties: {
                    name: "c2",
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new Tree(astDesc);

    const res = v.validateFromRoot(ast);
    expect(res.errors.map(printableError)).toEqual([]);

    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
      const result = codeGen.emit(ast);
      expect(result).toEqual(
        `<root>\n  <% if var_name %>\n  <c1></c1>\n  <c2></c2>\n  <% end %>\n</root>`
      );
    }
    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_LIQUID);
      const result = codeGen.emit(ast);
      expect(result).toEqual(
        `<root>\n  {% if var_name %}\n  <c1></c1>\n  <c2></c2>\n  {% end %}\n</root>`
      );
    }
  });

  it(`<root><% if var_name == var_name %><% end %></root>`, () => {
    const v = new Validator([GRAMMAR_DESCRIPTION]);

    const astDesc: NodeDescription = {
      language: "dxml",
      name: "element",
      properties: {
        name: "root",
      },
      children: {
        elements: [
          {
            language: "dxml",
            name: "if",
            children: {
              condition: [
                {
                  language: "dxml",
                  name: "exprBinary",
                  children: {
                    lhs: [
                      {
                        language: "dxml",
                        name: "exprVar",
                        properties: {
                          name: "var_name",
                        },
                      },
                    ],
                    operator: [
                      {
                        language: "dxml",
                        name: "binaryOperator",
                        properties: {
                          operator: "==",
                        },
                      },
                    ],
                    rhs: [
                      {
                        language: "dxml",
                        name: "exprVar",
                        properties: {
                          name: "var_name",
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

    const ast = new Tree(astDesc);

    const res = v.validateFromRoot(ast);
    expect(res.errors.map(printableError)).toEqual([]);

    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_ERUBY);
      const result = codeGen.emit(ast);
      expect(result).toEqual(
        `<root>\n  <% if var_name == var_name %>\n  <% end %>\n</root>`
      );
    }
    {
      const codeGen = new CodeGenerator(NODE_CONVERTER_LIQUID);
      const result = codeGen.emit(ast);
      expect(result).toEqual(
        `<root>\n  {% if var_name == var_name %}\n  {% end %}\n</root>`
      );
    }
  });
});
