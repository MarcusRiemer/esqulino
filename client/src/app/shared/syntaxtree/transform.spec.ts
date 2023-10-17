import { startTransaction } from "@sentry/browser";
import * as AST from "./syntaxtree";
import { apply } from "./transform";

const patterns : string[] = [] ;

it("Multivalued character nodes are seperated into multiple single valued character nodes", () => {
    /** 
     * Syntax tree for testing the splitting of a single character node into multiple ones if it 
     * contains more then one character in its property value. 
     */

    const inputDesc : AST.NodeDescription = {
        language : "regex-test", 
        name: "root", 
        children: {
            nodes: [
                {
                    language: "regex-test", 
                    name: "char", 
                    properties: 
                    {
                        value: "abcd",
                    }
                }
            ]
        }
    };

    const resultDesc : AST.NodeDescription = {
        language : "regex-test",
        name: "root", 
        children: {
            nodes: [
                {
                    language: "regex-test", 
                    name: "invis-container", 
                    children: {
                        nodes: [
                            {
                                language: "regex-test", 
                                name: "char", 
                                properties: 
                                {
                                    value: "a",
                                }
                            }, 
                            {
                                language: "regex-test", 
                                name: "char", 
                                properties: 
                                {
                                    value: "b",
                                }
                            }, 
                            {
                                language: "regex-test", 
                                name: "char", 
                                properties: 
                                {
                                    value: "c",
                                }
                            }, 
                            {
                                language: "regex-test", 
                                name: "char", 
                                properties: 
                                {
                                    value: "d",
                                }
                            },
                        ]
                    }
                }
            ]
        }
    };

    const inp = new AST.SyntaxTree(inputDesc); 
    const res = new AST.SyntaxTree(resultDesc); 
    expect(res).toEqual(apply(inp, patterns)); 
});

it ("Autowrapping of single root quantifier nodes with an invis-container node", () => {
    // Cases for Quantifiers
        // * | + | ?

    const starQuantifierDesc : AST.NodeDescription = 
    {
        name: "builtInQuantifier",
        language: "regex",
        properties: {
            symbol: "*"
        },
        children: {
            element: [
            {
                name: "string",
                language: "regex",
                properties: {
                    value: "abc"
                }
            }
            ],
        }
    }

    const inputDesc: AST.NodeDescription = {
        language : "regex", 
        name: "root", 
        children: {
            nodes: [
                starQuantifierDesc,
            ]
        }
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
                      elements: [
                        starQuantifierDesc,
                      ]
                    }
                }
            ]
        }
    };

    const inp = new AST.SyntaxTree(inputDesc); 
    const res = new AST.SyntaxTree(resultDesc); 
    expect(res).toEqual(apply(inp, patterns)); 

}); 

it ("Autowrapping of single root element pattern nodes with an invis-container node", () => {
    // Cases for ElemPatterns
    // String
    // Char
    // Set 
    // Group
    // Shorthand
    // Meta-chars

    const stringNodeDesc : AST.NodeDescription = {
        "name": "string",
        "language": "regex",
        "properties": {
          "value": "12345"
        }
    }

    const inputDesc: AST.NodeDescription = {
        language: "regex", 
        name: "root", 
        children: {
            nodes: [
                stringNodeDesc,
            ]
        }
    }

    const resultDesc: AST.NodeDescription = {
        language: "regex", 
        name: "root", 
        children: {
            nodes: [
                {
                    "name": "invis-container",
                    "language": "regex",
                    "children": {
                      "elements": [
                        {
                          "name": "string",
                          "language": "regex",
                          "properties": {
                            "value": "12345"
                          }
                        }
                      ]
                    }
                }
            ]
        }
    }


    const inp = new AST.SyntaxTree(inputDesc); 
    const res = new AST.SyntaxTree(resultDesc); 
    expect(res).toEqual(apply(inp, patterns)); 

}); 

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

it ("Removal of nested invis-container nodes", () => {
    const inputDesc: AST.NodeDescription = {
        language: "regex", 
        name: "root", 
        children: {
            nodes: [
                {
                    "name": "invis-container",
                    "language": "regex",
                    "children": {
                      "elements": [
                        {
                          "name": "invis-container",
                          "language": "regex",
                          "children": {
                            "elements": [
                              {
                                "name": "group",
                                "language": "regex",
                                "children": {
                                  "elements": [
                                    {
                                      "name": "string",
                                      "language": "regex",
                                      "properties": {
                                        "value": "abcd"
                                      }
                                    }
                                  ]
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                }
            ]
        }
    }

    const resultDesc: AST.NodeDescription = {
        language: "regex", 
        name: "root", 
        children: {
            nodes: [
                {
                    "name": "invis-container",
                    "language": "regex",
                    "children": {
                      "elements": [
                        {
                          "name": "group",
                          "language": "regex",
                          "children": {
                            "elements": [
                              {
                                "name": "string",
                                "language": "regex",
                                "properties": {
                                  "value": "abcd"
                                }
                              }
                            ]
                          }
                        }
                      ]
                    }
                }
            ]
        }
    }


    const inp = new AST.SyntaxTree(inputDesc); 
    const res = new AST.SyntaxTree(resultDesc); 
    expect(res).toEqual(apply(inp, patterns)); 

}); 

it ("Merging of two sibling invis-container nodes into one invis-container node that contains all their children", () => {

    const inputDesc: AST.NodeDescription = {
        language: "regex", 
        name: "root", 
        children: {
            nodes: [
                {
                    "name": "group",
                    "language": "regex",
                    "children": {
                      "elements": [
                        {
                          "name": "invis-container",
                          "language": "regex",
                          "children": {
                            "elements": [
                                {
                                    "name": "string",
                                    "language": "regex",
                                    "properties": {
                                      "value": "hello "
                                    }
                                  }
                            ]
                          }
                        },
                        {
                          "name": "invis-container",
                          "language": "regex",
                          "children": {
                            "elements": [
                                {
                                    "name": "string",
                                    "language": "regex",
                                    "properties": {
                                      "value": "world"
                                    }
                                }
                            ]
                          }
                        }
                      ]
                    }
                }
            ]
        }
    }

    const resultDesc: AST.NodeDescription = {
        language: "regex", 
        name: "root", 
        children: {
            nodes: [
                {
                    "name": "group",
                    "language": "regex",
                    "children": {
                      "elements": [
                        {
                          "name": "invis-container",
                          "language": "regex",
                          "children": {
                            "elements": [
                                {
                                    "name": "string",
                                    "language": "regex",
                                    "properties": {
                                      "value": "hello "
                                    }
                                }, 
                                {
                                    "name": "string",
                                    "language": "regex",
                                    "properties": {
                                      "value": "world"
                                    }
                                }
                            ]
                          }
                        }, 
                      ]
                    }
                }
            ]
        }
    }

    const inp = new AST.SyntaxTree(inputDesc); 
    const res = new AST.SyntaxTree(resultDesc); 
    expect(res).toEqual(apply(inp, patterns)); 
}); 