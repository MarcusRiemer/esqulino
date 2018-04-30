import * as Schema from './grammar.description'
import * as AST from './syntaxtree'
import { Validator } from './validator'
import { ErrorCodes, ValidationResult } from './validation-result'

/**
 * Describes a language where each document would be the equivalent
 * to something like
 * <html>
 *   <head></head>
 *   <body>
 *     <h1 id="the-only">Heading</h1>
 *     <p class="foo bar">Paragraph 1</p>
 *     <p class="hello world">Paragraph 2</p>
 *   </body>
 * </html>
 */
const langMiniHtml: Schema.GrammarDescription = {
  languageName: "mini-html",
  types: {
    "text": {
      attributes: [
        {
          name: "text",
          type: "property",
          base: "string",
        }
      ]
    },
    "html": {
      attributes: [
        {
          name: "children",
          type: "sequence",
          nodeTypes: ["head", "body"]
        }
      ]
    },
    "head": {
      attributes: [
        {
          name: "children",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "text",
              occurs: "*"
            }
          ]
        }
      ]
    },
    "body": {
      attributes: [
        {
          name: "children",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "paragraph",
              occurs: "*"
            },
            {
              nodeType: "heading",
              occurs: "*"
            }
          ]
        }
      ]
    },
    "paragraph": {
      attributes: [
        {
          name: "attributes",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "attr-class",
              occurs: "?"
            }
          ]
        },
        {
          name: "children",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "text",
              occurs: "*"
            }
          ]

        }
      ]
    },
    "heading": {
      attributes: [
        {
          name: "attributes",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "attr-id",
              occurs: "?"
            }
          ]
        },
        {
          name: "children",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "text",
              occurs: "*"
            }
          ]

        }
      ]
    },
    "attr-class": {
      attributes: [
        {
          name: "classes",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "text",
              occurs: "*"
            }
          ]
        }
      ]
    },
    "attr-id": {
      attributes: [
        {
          name: "id",
          type: "property",
          base: "string"
        }
      ]
    }
  },
  root: "html"
};

/**
 * Describes a language where each query would be the equivalent
 * to something like
 *
 * SELECT
 * FROM
 * WHERE
 *
 * or
 *
 * DELETE
 * FROM
 * WHERE
 */
const langMiniSql: Schema.GrammarDescription = {
  languageName: "mini-sql",
  types: {
    "root": {
      oneOf: ["query-select", "query-delete"]
    },
    "select": {},
    "delete": {},
    "from": {},
    "where": {},
    "query-select": {
      attributes: [
        {
          name: "children",
          type: "sequence",
          nodeTypes: ["select", "from", "where"]
        }
      ]
    },
    "query-delete": {
      attributes: [
        {
          name: "children",
          type: "sequence",
          nodeTypes: ["delete", "from", "where"]
        }
      ]
    }
  },
  root: "root"
}

/**
 * A single node that uses every possible string constraint.
 */
const langStringConstraint: Schema.GrammarDescription = {
  languageName: "string-constraint",
  types: {
    root: {
      attributes: [
        {
          name: "len",
          type: "property",
          base: "string",
          restrictions: [
            { type: "length", value: 1 }
          ]
        },
        {
          name: "min",
          type: "property",
          base: "string",
          restrictions: [
            { type: "minLength", value: 2 }
          ]
        },
        {
          name: "max",
          type: "property",
          base: "string",
          restrictions: [
            { type: "maxLength", value: 2 }
          ]
        },
        {
          name: "enum",
          type: "property",
          base: "string",
          restrictions: [
            {
              type: "enum",
              value: ["a", "b", "c"]
            }
          ]
        }
      ]
    }
  },
  root: "root"
}

/**
 * A single root node that uses some children with the "allowed" constraint
 */
const langAllowedConstraint: Schema.GrammarDescription = {
  languageName: "allowed-constraint",
  types: {
    "root": {
      attributes: [
        {
          name: "nodes",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "a",
              occurs: "*"
            },
            {
              nodeType: "b",
              occurs: {
                minOccurs: 0,
                maxOccurs: 2
              }
            },
            {
              nodeType: "c",
              occurs: "1"
            }
          ]
        }
      ],
    },
    "a": {},
    "b": {},
    "c": {}
  },
  root: "root"
}

/**
 * A single root node that uses some children with the "sequence" constraint
 */
const langSequenceConstraint: Schema.GrammarDescription = {
  languageName: "sequence-constraint",
  types: {
    "root": {
      attributes: [
        {
          name: "nodes",
          type: "sequence",
          nodeTypes: [
            "a",
            {
              nodeType: "b",
              occurs: {
                minOccurs: 0,
                maxOccurs: 2,
              }
            },
            "a",
            {
              nodeType: "c",
              occurs: {
                minOccurs: 1,
                maxOccurs: 2
              }
            }
          ]
        }
      ],
    },
    "a": {},
    "b": {},
    "c": {}
  },
  root: "root"
};

/**
 * A single root node that uses some children with the "sequence" constraint
 */
const langOneOfNodes: Schema.GrammarDescription = {
  languageName: "oneof-nodes",
  types: {
    "root": {
      oneOf: ["a", "b"]
    } as Schema.NodeTypeDescription,
    "a": {},
    "b": {},
    "c": {}
  },
  root: "root"
}

/**
 * A single node with only boolean properties.
 */
const langBooleanConstraint: Schema.GrammarDescription = {
  languageName: "boolean-constraint",
  types: {
    "root": {
      attributes: [
        {
          name: "foo",
          type: "property",
          base: "boolean",
        }
      ]
    }
  },
  root: "root"
}

/**
 * A single node that may have optional properties.
 */
const langOptionalProperty: Schema.GrammarDescription = {
  languageName: "optionalProperty",
  types: {
    "root": {
      attributes: [
        {
          name: "required",
          type: "property",
          base: "string",
        },
        {
          name: "optional",
          type: "property",
          base: "string",
          isOptional: true
        }
      ]
    }
  },
  root: "root"
}

const langSimpleChoice: Schema.GrammarDescription = {
  languageName: "simpleChoice",
  types: {
    "root": {
      attributes: [
        {
          name: "nodes",
          type: "choice",
          choices: ["a", "b"]
        }
      ]
    },
    "a": {},
    "b": {}
  },
  root: "root"
}

const langComplexChoice: Schema.GrammarDescription = {
  languageName: "complexChoice",
  types: {
    "root": {
      attributes: [
        {
          name: "choice",
          type: "choice",
          choices: ["a", "b"]
        }
      ]
    },
    "a": {
      attributes: [
        {
          name: "sequence",
          type: "sequence",
          nodeTypes: ["c", "c"]
        }
      ]
    },
    "b": {
      attributes: [
        {
          name: "allowed",
          type: "allowed",
          nodeTypes: ["d", "c"]
        }
      ]
    },
    "c": {},
    "d": {}
  },
  root: "root"
}

describe('Grammar Validation', () => {
  /*
   * This is more a compile time testcase. It ensures that the grammar
   * definition allows the definition of "empty types" without having a
   * clash between oneOf and complex types.
   */
  it('Grammar Empty Nodes', () => {
    const g: Schema.GrammarDescription = {
      languageName: "emptyNodes",
      root: "r",
      types: {
        "r": {}
      }
    };

    const v = new Validator([g]);

    const ast = new AST.Tree({
      language: "emptyNodes",
      name: "r"
    });

    expect(v.validateFromRoot(ast).isValid).toBe(true);
  });


  it('Empty Tree', () => {
    const v = new Validator([langStringConstraint]);

    const ast = new AST.Tree(undefined);
    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.Empty);
  });


  it('String Constraints (Valid)', () => {
    const v = new Validator([langStringConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "string-constraint",
      name: "root",
      properties: {
        "len": "1",
        "min": "12",
        "max": "12",
        "enum": "a",
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('String Constraints (Invalid)', () => {
    const v = new Validator([langStringConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "string-constraint",
      name: "root",
      properties: {
        "len": "12",
        "min": "1",
        "max": "123",
        "enum": "d",
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(4);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalPropertyType)
    expect(res.errors[0].data.condition).toEqual("2 != 1");
    expect(res.errors[1].code).toEqual(ErrorCodes.IllegalPropertyType)
    expect(res.errors[1].data.condition).toEqual("1 < 2");
    expect(res.errors[2].code).toEqual(ErrorCodes.IllegalPropertyType)
    expect(res.errors[2].data.condition).toEqual("3 > 2");
    expect(res.errors[3].code).toEqual(ErrorCodes.IllegalPropertyType)
    expect(res.errors[3].data.condition).toEqual(`"d" in ["a","b","c"]`);
  });

  it('Boolean Constraint', () => {
    const v = new Validator([langBooleanConstraint]);

    const astDescTrue: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        "foo": "true"
      }
    };

    const astTrue = new AST.Node(astDescTrue, undefined);
    const resTrue = v.validateFromRoot(astTrue);
    expect(resTrue.isValid).toBeTruthy();

    const astDescFalse: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        "foo": "false"
      }
    };

    const astFalse = new AST.Node(astDescFalse, undefined);
    const resFalse = v.validateFromRoot(astFalse);
    expect(resFalse.isValid).toBeTruthy();

    const astDescInvalid: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        "foo": "foo"
      }
    };

    const astInvalid = new AST.Node(astDescInvalid, undefined);
    const resInvalid = v.validateFromRoot(astInvalid);
    expect(resInvalid.errors.length).toEqual(1)
    expect(resInvalid.errors[0].code).toEqual(ErrorCodes.IllegalPropertyType);
  });

  it('Optional property missing', () => {
    const v = new Validator([langOptionalProperty]);

    const astDesc: AST.NodeDescription = {
      language: langOptionalProperty.languageName,
      name: "root",
      properties: {
        "required": ""
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.isValid).toBeTruthy();
  });

  it('Required property missing', () => {
    const v = new Validator([langOptionalProperty]);

    const astDesc: AST.NodeDescription = {
      language: langOptionalProperty.languageName,
      name: "root",
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingProperty);
  });

  it('Invalid oneOf: oneOf node in AST', () => {
    const v = new Validator([langOneOfNodes]);

    const astDesc: AST.NodeDescription = {
      language: "oneof-nodes",
      name: "root",
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.TransientNode);
  });

  it('Invalid oneOf: No match', () => {
    const v = new Validator([langOneOfNodes]);

    const astDesc: AST.NodeDescription = {
      language: "oneof-nodes",
      name: "c",
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.UnexpectedType);
  });

  it('oneOf: allowsChildType()', () => {
    const v = new Validator([langOneOfNodes]);

    const vRoot = v.availableTypes[0];
    const vNodeA = v.availableTypes[1];
    const vNodeB = v.availableTypes[2];
    const vNodeC = v.availableTypes[3];

    const tNodeA = { languageName: langOneOfNodes.languageName, typeName: "a" };
    const tNodeB = { languageName: langOneOfNodes.languageName, typeName: "b" };
    const tNodeC = { languageName: langOneOfNodes.languageName, typeName: "c" };
    const tNodeD = { languageName: langOneOfNodes.languageName, typeName: "d" };

    expect(vRoot.allowsChildType(tNodeA, "nodes")).toBeTruthy("a in root");
    expect(vRoot.allowsChildType(tNodeB, "nodes")).toBeTruthy("b in root");
    expect(vRoot.allowsChildType(tNodeC, "nodes")).toBeFalsy("c in root");
    expect(vRoot.allowsChildType(tNodeD, "nodes")).toBeFalsy("d in root");

    expect(vNodeA.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeD, "nodes")).toBe(false);

    expect(vNodeB.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeD, "nodes")).toBe(false);

    expect(vNodeC.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeD, "nodes")).toBe(false);

  });

  it('"sequence": Required children categories', () => {
    const v = new Validator([langSequenceConstraint]);

    const root = v.getType(langSequenceConstraint.languageName, "root");
    expect(root.requiredChildrenCategoryNames).toEqual(["nodes"]);

    const a = v.getType(langSequenceConstraint.languageName, "a");
    expect(a.requiredChildrenCategoryNames).toEqual([]);
  });

  it('"sequence": allowsChildType()', () => {
    const v = new Validator([langSequenceConstraint]);
    const vNodeA = v.availableTypes[0];
    const vNodeB = v.availableTypes[1];
    const vNodeC = v.availableTypes[2];

    const tNodeA = { languageName: langSequenceConstraint.languageName, typeName: "a" };
    const tNodeB = { languageName: langSequenceConstraint.languageName, typeName: "b" };
    const tNodeC = { languageName: langSequenceConstraint.languageName, typeName: "c" };
    const tNodeD = { languageName: langSequenceConstraint.languageName, typeName: "d" };

    expect(vNodeA.allowsChildType(tNodeA, "nodes")).toBeTruthy();
    expect(vNodeA.allowsChildType(tNodeB, "nodes")).toBeTruthy();
    expect(vNodeA.allowsChildType(tNodeC, "nodes")).toBeTruthy();
    expect(vNodeA.allowsChildType(tNodeD, "nodes")).toBeFalsy();

    expect(vNodeB.allowsChildType(tNodeA, "nodes")).toBeFalsy();
    expect(vNodeB.allowsChildType(tNodeB, "nodes")).toBeFalsy();
    expect(vNodeB.allowsChildType(tNodeC, "nodes")).toBeFalsy();
    expect(vNodeB.allowsChildType(tNodeD, "nodes")).toBeFalsy();

    expect(vNodeC.allowsChildType(tNodeA, "nodes")).toBeFalsy();
    expect(vNodeC.allowsChildType(tNodeB, "nodes")).toBeFalsy();
    expect(vNodeC.allowsChildType(tNodeC, "nodes")).toBeFalsy();
    expect(vNodeC.allowsChildType(tNodeD, "nodes")).toBeFalsy();
  });

  it('Invalid "sequence": Completely Empty', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(3);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a",
      },
      index: 0,
      childrenCategory: "nodes"
    });
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a",
      },
      index: 1,
      childrenCategory: "nodes"
    });
    expect(res.errors[2].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[2].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c",
      },
      index: 2,
      childrenCategory: "nodes"
    });
  });

  it('Invalid "sequence": Only first required node', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a"
      },
      index: 1,
      childrenCategory: "nodes"
    });
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c"
      },
      index: 2,
      childrenCategory: "nodes"
    });
  });

  it('Invalid "sequence": Only first two required nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "a"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c"
      },
      index: 2,
      childrenCategory: "nodes"
    });
  });

  it('Valid "sequence": Exact three required nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Valid "sequence": Three required nodes + Optional "b"-node', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Valid "sequence": Three required nodes + two optional "b"-nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Valid "sequence": Three required nodes + All optional "b"- and "c"-nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Invalid "sequence": Three required nodes + All optional "b"- and "c"-nodes + extra node', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          },
          {
            language: "sequence-constraint",
            name: "c"
          },
          {
            language: "sequence-constraint",
            name: "a"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
  });

  it('Invalid "sequence": Three required nodes + three optional "b"-nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "b"
          },
          {
            language: "sequence-constraint",
            name: "a"
          },
          {
            language: "sequence-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
  });

  it('"allowed": Required children categories', () => {
    const v = new Validator([langAllowedConstraint]);

    const root = v.getType(langAllowedConstraint.languageName, "root");
    expect(root.requiredChildrenCategoryNames).toEqual(["nodes"]);

    const a = v.getType(langAllowedConstraint.languageName, "a");
    expect(a.requiredChildrenCategoryNames).toEqual([]);
  });

  it('"allowed": allowsChildType', () => {
    const v = new Validator([langAllowedConstraint]);
    const vRoot = v.availableTypes[0];
    const vNodeA = v.availableTypes[1];
    const vNodeB = v.availableTypes[2];
    const vNodeC = v.availableTypes[3];

    const tNodeA = { languageName: langAllowedConstraint.languageName, typeName: "a" };
    const tNodeB = { languageName: langAllowedConstraint.languageName, typeName: "b" };
    const tNodeC = { languageName: langAllowedConstraint.languageName, typeName: "c" };
    const tNodeD = { languageName: langAllowedConstraint.languageName, typeName: "d" };

    expect(vRoot.allowsChildType(tNodeA, "nodes")).toBeTruthy("a in root");
    expect(vRoot.allowsChildType(tNodeB, "nodes")).toBeTruthy("b in root");
    expect(vRoot.allowsChildType(tNodeC, "nodes")).toBeTruthy("c in root");
    expect(vRoot.allowsChildType(tNodeD, "nodes")).toBeFalsy("d in root");

    expect(vNodeA.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeD, "nodes")).toBe(false);

    expect(vNodeB.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeD, "nodes")).toBe(false);

    expect(vNodeC.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeD, "nodes")).toBe(false);
  });

  it('Invalid "allowed": Empty', () => {
    const v = new Validator([langAllowedConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "allowed-constraint",
      name: "root",
      children: {
        "nodes": []
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
  });

  it('Valid "allowed": Required "c" node first', () => {
    const v = new Validator([langAllowedConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "allowed-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "allowed-constraint",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it('Valid "allowed": All allowed nodes once', () => {
    const v = new Validator([langAllowedConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "allowed-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "allowed-constraint",
            name: "c"
          },
          {
            language: "allowed-constraint",
            name: "b"
          },
          {
            language: "allowed-constraint",
            name: "a"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Invalid "allowed": No "c" but too many "b"', () => {
    const v = new Validator([langAllowedConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "allowed-constraint",
      name: "root",
      children: {
        "nodes": [
          {
            language: "allowed-constraint",
            name: "b"
          },
          {
            language: "allowed-constraint",
            name: "b"
          },
          {
            language: "allowed-constraint",
            name: "b"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.InvalidMaxOccurences);
    expect(res.errors[1].code).toEqual(ErrorCodes.InvalidMinOccurences);
  });

  it('Valid Choice (simple): a', () => {
    const v = new Validator([langSimpleChoice]);

    const astDesc: AST.NodeDescription = {
      language: "simpleChoice",
      name: "root",
      children: {
        "nodes": [
          {
            language: "simpleChoice",
            name: "a"
          }
        ]
      }
    }

    const ast = new AST.Tree(astDesc)
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it('Valid Choice (simple): b', () => {
    const v = new Validator([langSimpleChoice]);

    const astDesc: AST.NodeDescription = {
      language: "simpleChoice",
      name: "root",
      children: {
        "nodes": [
          {
            language: "simpleChoice",
            name: "b"
          }
        ]
      }
    }

    const ast = new AST.Tree(astDesc)
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it('Invalid Choice (simple): c', () => {
    const v = new Validator([langSimpleChoice]);

    const astDesc: AST.NodeDescription = {
      language: "simpleChoice",
      name: "root",
      children: {
        "nodes": [
          {
            language: "simpleChoice",
            name: "c"
          }
        ]
      }
    }

    const ast = new AST.Tree(astDesc)
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.NoChoiceMatching);
  });

  it('Valid Choice: a, but a itself is not valid', () => {
    const v = new Validator([langSimpleChoice]);

    const astDesc: AST.NodeDescription = {
      language: "simpleChoice",
      name: "root",
      children: {
        "nodes": [
          {
            language: "simpleChoice",
            name: "a",
            children: {
              "tooMuch": [

              ]
            }
          }
        ]
      }
    }

    const ast = new AST.Tree(astDesc)
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.SuperflousChildCategory);
  });

  it('Valid Choice (complex): allowsChildType', () => {
    const v = new Validator([langComplexChoice]);

    const type_root = { languageName: "complexChoice", typeName: "root" };
    const type_a = { languageName: "complexChoice", typeName: "a" };
    const type_b = { languageName: "complexChoice", typeName: "b" };
    const type_c = { languageName: "complexChoice", typeName: "c" };
    const type_d = { languageName: "complexChoice", typeName: "d" };

    expect(v.getType(type_root).allowsChildType(type_a, "choice")).toBe(true, "root => a");
    expect(v.getType(type_root).allowsChildType(type_b, "choice")).toBe(true, "root => b");
    expect(v.getType(type_root).allowsChildType(type_c, "choice")).toBe(false, "root => c");
    expect(v.getType(type_root).allowsChildType(type_d, "choice")).toBe(false, "root => d");

    expect(v.getType(type_a).allowsChildType(type_a, "sequence")).toBe(false, "a => a");
    expect(v.getType(type_a).allowsChildType(type_b, "sequence")).toBe(false, "a => b");
    expect(v.getType(type_a).allowsChildType(type_c, "sequence")).toBe(true, "a => c");
    expect(v.getType(type_a).allowsChildType(type_d, "sequence")).toBe(false, "a => d");

    expect(v.getType(type_b).allowsChildType(type_a, "allowed")).toBe(false, "b => a");
    expect(v.getType(type_b).allowsChildType(type_b, "allowed")).toBe(false, "b => b");
    expect(v.getType(type_b).allowsChildType(type_c, "allowed")).toBe(true, "b => c");
    expect(v.getType(type_b).allowsChildType(type_d, "allowed")).toBe(true, "b => d");
  });

  it('Valid Choice (complex): sequence in a is too short', () => {
    const v = new Validator([langComplexChoice]);

    const astDesc: AST.NodeDescription = {
      language: "complexChoice",
      name: "root",
      children: {
        "choice": [
          {
            language: "complexChoice",
            name: "c"
          }
        ]
      }
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(1);
  });

  it('Validating tree of unknown language', () => {
    const v = new Validator([langAllowedConstraint, langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "nonexistant",
      name: "irrelevant",
    };

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);

    const err = res.errors[0];
    expect(err.code).toEqual(ErrorCodes.UnknownRootLanguage);
    expect(err.data.requiredLanguage).toEqual(astDesc.language);
    expect(err.data.availableLanguages).toEqual(["allowed-constraint", "sequence-constraint"]);
  });

  it('Mini-SQL: Empty SELECT query', () => {
    const v = new Validator([langMiniSql]);

    const astDesc: AST.NodeDescription = {
      language: "mini-sql",
      name: "query-select"
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(3, res);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild)
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild)
    expect(res.errors[2].code).toEqual(ErrorCodes.MissingChild)
  });

  it('Mini-SQL: registers types', () => {
    const v = new Validator([langMiniSql]);

    expect(v.isKnownLanguage(langMiniSql.languageName)).toBeTruthy();
    for (let nodeName in langMiniSql.types) {
      expect(v.isKnownType(langMiniSql.languageName, nodeName)).toBeTruthy();
    }
  });

  it('Mini-HTML: registers types', () => {
    const v = new Validator([langMiniHtml]);

    expect(v.isKnownLanguage(langMiniHtml.languageName)).toBeTruthy();
    for (let nodeName in langMiniHtml.types) {
      expect(v.isKnownType(langMiniHtml.languageName, nodeName)).toBeTruthy();
    }
  });

  it('Mini-HTML: empty', () => {
    const v = new Validator([langMiniHtml]);
    const res = v.validateFromRoot(undefined);

    expect(res.errors.length).toEqual(1);
  });

  it('Mini-HTML: superflous children', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          { language: "mini-html", name: "head" },
          { language: "mini-html", name: "body" }
        ],
        superflous: [
          { language: "mini-html", name: "mini-html" }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.SuperflousChildCategory)
  });

  it('Mini-HTML: Empty document', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html"
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(2, res);

    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild)
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild)
  });

  it('Mini-HTML: Minimal document', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          {
            language: "mini-html",
            name: "head",
            children: {
              children: [
                {
                  language: "mini-html",
                  name: "text",
                  properties: {
                    "text": "Minimal"
                  }
                }
              ]
            }
          },
          { language: "mini-html", name: "body" }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(0, res);
  });

  it('Mini-HTML: Heading and paragraph', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          { language: "mini-html", name: "head" },
          {
            language: "mini-html",
            name: "body",
            children: {
              children: [
                {
                  language: "mini-html",
                  name: "heading"
                },
                {
                  language: "mini-html",
                  name: "paragraph"
                }
              ]
            }
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(0, res);
  });

  it('Mini-HTML: Invalid body (HTML again)', () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          { language: "mini-html", name: "head" },
          {
            language: "mini-html",
            name: "body",
            children: {
              children: [
                {
                  language: "mini-html",
                  name: "html"
                }
              ]
            }
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(1, res);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalChildType);
    expect(JSON.stringify(res.errors[0].data)).toBeTruthy("Should be pure data");
  });

  it('Mini-HTML: Invalid single child (SQL query)', () => {
    const v = new Validator([langMiniHtml, langMiniSql]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          {
            language: "mini-sql",
            name: "query-select"
          }
        ]
      }
    }

    const ast = new AST.Node(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.isValid).toBeFalsy();
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalChildType);
    expect(JSON.stringify(res.errors[0].data)).toBeTruthy("Should be pure data");
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(JSON.stringify(res.errors[1].data)).toBeTruthy("Should be pure data");
  });
});
