import * as AST from "./syntaxtree";
import { apply } from "./transform";

const patterns: string[] = [];

describe("Multivalued character nodes are seperated into multiple single valued character nodes", () => {
  it('"abcd" should be split into " a | b | c | d "', () => {
    /**
     * Syntax tree for testing the splitting of a single character node into multiple ones if it
     * contains more then one character in its property value.
     */

    const inputDesc: AST.NodeDescription = {
      language: "regex-test",
      name: "char",
      properties: {
        value: "abcd",
      },
    };

    const resultDesc: AST.NodeDescription = {
      language: "regex-test",
      name: "invis-container",
      children: {
        nodes: [
          {
            language: "regex-test",
            name: "char",
            properties: {
              value: "a",
            },
          },
          {
            language: "regex-test",
            name: "char",
            properties: {
              value: "b",
            },
          },
          {
            language: "regex-test",
            name: "char",
            properties: {
              value: "c",
            },
          },
          {
            language: "regex-test",
            name: "char",
            properties: {
              value: "d",
            },
          },
        ],
      },
    };

    const inp = new AST.SyntaxTree(inputDesc);
    const res = new AST.SyntaxTree(resultDesc);
    expect(res).toEqual(apply(inp, patterns));
  });
});

describe("Root quantifier nodes should be wrapped with an invis-container node", () => {
  it("Autowrapping of a root star quantifier", () => {
    // Cases for Quantifiers
    // * | + | ?

    const starQuantifierDesc: AST.NodeDescription = {
      name: "builtInQuantifier",
      language: "regex",
      properties: {
        symbol: "*",
      },
      children: {
        element: [
          {
            name: "string",
            language: "regex",
            properties: {
              value: "abc",
            },
          },
        ],
      },
    };

    const inputDesc: AST.NodeDescription = {
      language: "regex",
      name: "root",
      children: {
        nodes: [starQuantifierDesc],
      },
    };

    const resultDesc: AST.NodeDescription = {
      language: "regex",
      name: "root",
      children: {
        nodes: [
          {
            name: "invis-container",
            language: "regex",
            children: {
              elements: [starQuantifierDesc],
            },
          },
        ],
      },
    };

    const inp = new AST.SyntaxTree(inputDesc);
    const res = new AST.SyntaxTree(resultDesc);
    expect(res).toEqual(apply(inp, patterns));
  });
});

describe("Root element pattern nodes should be autowrapped with an invis-container node", () => {
  // Cases for ElemPatterns
  // String
  // Char
  // Set
  // Group
  // Shorthand
  // Meta-chars

  it("Autowrapping of root string node", () => {
    const stringNodeDesc: AST.NodeDescription = {
      name: "string",
      language: "regex",
      properties: {
        value: "12345",
      },
    };

    const inputDesc: AST.NodeDescription = {
      language: "regex",
      name: "root",
      children: {
        nodes: [stringNodeDesc],
      },
    };

    const resultDesc: AST.NodeDescription = {
      language: "regex",
      name: "root",
      children: {
        nodes: [
          {
            name: "invis-container",
            language: "regex",
            children: {
              elements: [stringNodeDesc],
            },
          },
        ],
      },
    };

    const inp = new AST.SyntaxTree(inputDesc);
    const res = new AST.SyntaxTree(resultDesc);
    expect(res).toEqual(apply(inp, patterns));
  });
});

describe("Root alternation nodes should be be autowrapped with an invis-container node", () => {
  /* it ("Autowrapping of single root alternation pattern nodes with an invis-container node", () => {
    // Cases for alternations 
        // Binary Alternation 
        // N-ary Alternation

    const binaryAltDesc : AST.NodeDescription = {

    }

    const inputDesc: AST.NodeDescription = {
        language: "regex", 
        name: "root", 
        children: {
            nodes: [
                
            ]
        }
    }

    const resultDesc: AST.NodeDescription = {
        language: "regex", 
        name: "root", 
        children: {
            nodes: [
                
            ]
        }
    }


    const inp = new AST.SyntaxTree(inputDesc); 
    const res = new AST.SyntaxTree(resultDesc); 
    expect(res).toEqual(apply(inp, patterns)); 

});  */
});

describe("Removal of undesirable invis-container nodes", () => {
  it("Removal of nested invis-container nodes", () => {
    const innerContentDesc = {
      name: "group",
      language: "regex",
      children: {
        elements: [
          {
            name: "string",
            language: "regex",
            properties: {
              value: "abcd",
            },
          },
        ],
      },
    };

    const inputDesc: AST.NodeDescription = {
      name: "invis-container",
      language: "regex",
      children: {
        elements: [
          {
            name: "invis-container",
            language: "regex",
            children: {
              elements: [innerContentDesc],
            },
          },
        ],
      },
    };

    const resultDesc: AST.NodeDescription = {
      name: "invis-container",
      language: "regex",
      children: {
        elements: [innerContentDesc],
      },
    };

    const inp = new AST.SyntaxTree(inputDesc);
    const res = new AST.SyntaxTree(resultDesc);
    expect(res).toEqual(apply(inp, patterns));
  });

  it("Merging of two sibling invis-container nodes into one invis-container node that contains all their children", () => {
    const childOneDesc = {
      name: "string",
      language: "regex",
      properties: {
        value: "hello ",
      },
    };

    const childTwoDesc = {
      name: "string",
      language: "regex",
      properties: {
        value: "world",
      },
    };

    const inputDesc: AST.NodeDescription = {
      name: "group",
      language: "regex",
      children: {
        elements: [
          {
            name: "invis-container",
            language: "regex",
            children: {
              elements: [childOneDesc],
            },
          },
          {
            name: "invis-container",
            language: "regex",
            children: {
              elements: [childTwoDesc],
            },
          },
        ],
      },
    };

    const resultDesc: AST.NodeDescription = {
      name: "group",
      language: "regex",
      children: {
        elements: [
          {
            name: "invis-container",
            language: "regex",
            children: {
              elements: [childOneDesc, childTwoDesc],
            },
          },
        ],
      },
    };

    const inp = new AST.SyntaxTree(inputDesc);
    const res = new AST.SyntaxTree(resultDesc);
    expect(res).toEqual(apply(inp, patterns));
  });
});
