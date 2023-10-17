import * as AST from "./syntaxtree";
import { apply } from "./transform";

/** 
 * Syntax tree for testing the splitting of a single character node into multiple ones if it contains more then one character in its property value. 
 */

const multiValuedCharacterNodeInput : AST.SyntaxTree = new AST.SyntaxTree( 
    {
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
    }
);

const multiValuedCharacterNodeResult: AST.SyntaxTree = new AST.SyntaxTree (
    {
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
    }
);

it("Multivalued character nodes are seperated into multiple single valued character nodes", () => {
    expect(multiValuedCharacterNodeResult).toEqual(apply(multiValuedCharacterNodeInput, []));
});