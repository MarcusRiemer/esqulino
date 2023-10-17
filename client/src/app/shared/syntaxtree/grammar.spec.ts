import * as AST from "./syntaxtree";
import { Validator } from "./validator";
import { ErrorCodes } from "./validation-result";
import { NodePropertyIntegerValidator } from "./grammar";
import {
  mkSingleLanguageGrammar,
  mkGrammarDoc,
  comparableErrors,
} from "./grammar.spec-util";
import { getQualifiedTypes } from "./grammar-type-util";
import { NodeDescription } from "./syntaxtree.description";
import { GrammarDocument } from "./grammar.description";

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
const langMiniHtml = mkSingleLanguageGrammar("mini-html", "html", {
  text: {
    type: "concrete",
    attributes: [
      {
        name: "text",
        type: "property",
        base: "string",
      },
    ],
  },
  html: {
    type: "concrete",
    attributes: [
      {
        name: "children",
        type: "sequence",
        nodeTypes: ["head", "body"],
      },
    ],
  },
  head: {
    type: "concrete",
    attributes: [
      {
        name: "children",
        type: "allowed",
        nodeTypes: [
          {
            nodeType: "text",
            occurs: "*",
          },
        ],
      },
    ],
  },
  body: {
    type: "concrete",
    attributes: [
      {
        name: "children",
        type: "allowed",
        nodeTypes: [
          {
            nodeType: "paragraph",
            occurs: "*",
          },
          {
            nodeType: "heading",
            occurs: "*",
          },
        ],
      },
    ],
  },
  paragraph: {
    type: "concrete",
    attributes: [
      {
        name: "attributes",
        type: "allowed",
        nodeTypes: [
          {
            nodeType: "attr-class",
            occurs: "?",
          },
        ],
      },
      {
        name: "children",
        type: "allowed",
        nodeTypes: [
          {
            nodeType: "text",
            occurs: "*",
          },
        ],
      },
    ],
  },
  heading: {
    type: "concrete",
    attributes: [
      {
        name: "attributes",
        type: "allowed",
        nodeTypes: [
          {
            nodeType: "attr-id",
            occurs: "?",
          },
        ],
      },
      {
        name: "children",
        type: "allowed",
        nodeTypes: [
          {
            nodeType: "text",
            occurs: "*",
          },
        ],
      },
    ],
  },
  "attr-class": {
    type: "concrete",
    attributes: [
      {
        name: "classes",
        type: "allowed",
        nodeTypes: [
          {
            nodeType: "text",
            occurs: "*",
          },
        ],
      },
    ],
  },
  "attr-id": {
    type: "concrete",
    attributes: [
      {
        name: "id",
        type: "property",
        base: "string",
      },
    ],
  },
});

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
const langMiniSql = mkSingleLanguageGrammar("mini-sql", "root", {
  root: {
    type: "oneOf",
    oneOf: ["query-select", "query-delete"],
  },
  select: { type: "concrete" },
  delete: { type: "concrete" },
  from: { type: "concrete" },
  where: { type: "concrete" },
  "query-select": {
    type: "concrete",
    attributes: [
      {
        name: "children",
        type: "sequence",
        nodeTypes: ["select", "from", "where"],
      },
    ],
  },
  "query-delete": {
    type: "concrete",
    attributes: [
      {
        name: "children",
        type: "sequence",
        nodeTypes: ["delete", "from", "where"],
      },
    ],
  },
});

/**
 * A single node that uses every possible string constraint.
 */
const langStringConstraint = mkSingleLanguageGrammar(
  "string-constraint",
  "root",
  {
    root: {
      type: "concrete",
      attributes: [
        {
          name: "len",
          type: "property",
          base: "string",
          restrictions: [{ type: "length", value: 1 }],
        },
        {
          name: "min",
          type: "property",
          base: "string",
          restrictions: [{ type: "minLength", value: 2 }],
        },
        {
          name: "max",
          type: "property",
          base: "string",
          restrictions: [{ type: "maxLength", value: 2 }],
        },
        {
          name: "enum",
          type: "property",
          base: "string",
          restrictions: [
            {
              type: "enum",
              value: ["a", "b", "c"],
            },
          ],
        },
        {
          name: "regex",
          type: "property",
          base: "string",
          restrictions: [
            {
              type: "regex",
              value: "^[a-zA-Z][a-zA-Z0-9_]*$",
            },
          ],
        },
      ],
    },
  }
);

/**
 * A single node that uses every possible integer constraint.
 */
const langIntegerConstraint = mkSingleLanguageGrammar(
  "integer-constraint",
  "root",
  {
    root: {
      type: "concrete",
      attributes: [
        {
          name: "minInclusive",
          type: "property",
          base: "integer",
          restrictions: [{ type: "minInclusive", value: 1 }],
        },
        {
          name: "maxInclusive",
          type: "property",
          base: "integer",
          restrictions: [{ type: "maxInclusive", value: 1 }],
        },
      ],
    },
  }
);

/**
 * A single root node that uses some children with the "allowed" constraint
 */
const langAllowedConstraint = mkSingleLanguageGrammar(
  "allowed-constraint",
  "root",
  {
    root: {
      type: "concrete",
      attributes: [
        {
          name: "nodes",
          type: "allowed",
          nodeTypes: [
            {
              nodeType: "a",
              occurs: "*",
            },
            {
              nodeType: "b",
              occurs: {
                minOccurs: 0,
                maxOccurs: 2,
              },
            },
            {
              nodeType: "c",
              occurs: "1",
            },
          ],
        },
      ],
    },
    a: { type: "concrete" },
    b: { type: "concrete" },
    c: { type: "concrete" },
  }
);

/**
 * A single root node that uses some children with the "sequence" constraint
 */
const langSingleSequenceConstraint = mkSingleLanguageGrammar(
  "single-sequence-constraint",
  "root",
  {
    root: {
      type: "concrete",
      attributes: [
        {
          name: "nodes",
          type: "sequence",
          nodeTypes: ["a"],
        },
      ],
    },
    a: { type: "concrete" },
  }
);

/**
 * A single root node that uses some children with the "sequence" constraint
 */
const langSequenceConstraint = mkSingleLanguageGrammar(
  "sequence-constraint",
  "root",
  {
    root: {
      type: "concrete",
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
              },
            },
            "a",
            {
              nodeType: "c",
              occurs: {
                minOccurs: 1,
                maxOccurs: 2,
              },
            },
          ],
        },
      ],
    },
    a: { type: "concrete" },
    b: { type: "concrete" },
    c: { type: "concrete" },
  }
);

/**
 * A single root node that uses some children with the "sequence" constraint
 */
const langOneOfNodes = mkSingleLanguageGrammar("oneof-nodes", "root", {
  root: {
    type: "oneOf",
    oneOf: ["a", "b"],
  },
  a: { type: "concrete" },
  b: { type: "concrete" },
  c: { type: "concrete" },
});

/**
 * A single node with only boolean properties.
 */
const langBooleanConstraint = mkSingleLanguageGrammar(
  "boolean-constraint",
  "root",
  {
    root: {
      type: "concrete",
      attributes: [
        {
          name: "foo",
          type: "property",
          base: "boolean",
        },
      ],
    },
  }
);

/**
 * A single node that may have optional properties.
 */
const langOptionalProperty = mkSingleLanguageGrammar(
  "optionalProperty",
  "root",
  {
    root: {
      type: "concrete",
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
          isOptional: true,
        },
      ],
    },
  }
);

const langSimpleChoice = mkSingleLanguageGrammar("simpleChoice", "root", {
  root: {
    type: "concrete",
    attributes: [
      {
        name: "nodes",
        type: "choice",
        choices: ["a", "b"],
      },
    ],
  },
  a: { type: "concrete" },
  b: { type: "concrete" },
});

const langComplexChoice = mkSingleLanguageGrammar("complexChoice", "root", {
  root: {
    type: "concrete",
    attributes: [
      {
        name: "choice",
        type: "choice",
        choices: ["a", "b"],
      },
    ],
  },
  a: {
    type: "concrete",
    attributes: [
      {
        name: "sequence",
        type: "sequence",
        nodeTypes: ["c", "c"],
      },
    ],
  },
  b: {
    type: "concrete",
    attributes: [
      {
        name: "allowed",
        type: "allowed",
        nodeTypes: ["d", "c"],
      },
    ],
  },
  c: { type: "concrete" },
  d: { type: "concrete" },
});

describe("Grammar Validation", () => {
  describe("Property Validators", () => {
    it("Integer", () => {
      const validator = new NodePropertyIntegerValidator({
        type: "property",
        name: "int",
        base: "integer",
      });

      expect(validator.validValue("1")).toBe(true);
      expect(validator.validValue("-1")).toBe(true);
      expect(validator.validValue("0")).toBe(true);
      expect(validator.validValue("-12")).toBe(true);
      expect(validator.validValue("12")).toBe(true);

      expect(validator.validValue("")).toBe(false);
      expect(validator.validValue("-")).toBe(false);
      expect(validator.validValue("+0")).toBe(false);
      expect(validator.validValue("+0.1")).toBe(false);
      expect(validator.validValue("-0.1")).toBe(false);
      expect(validator.validValue(" 0.1")).toBe(false);
      expect(validator.validValue(" 0.1 ")).toBe(false);
      expect(validator.validValue("1 ")).toBe(false);
      expect(validator.validValue(" 1")).toBe(false);
      expect(validator.validValue(" 1 ")).toBe(false);
      expect(validator.validValue(0 as any)).toBe(false, `typeof "number"`);
    });
  });

  /*
   * This is more a compile time testcase. It ensures that the grammar
   * definition allows the definition of "empty types" without having a
   * clash between oneOf and complex types.
   */
  it("Grammar Empty Nodes", () => {
    const g = mkSingleLanguageGrammar("emptyNodes", "r", {
      r: { type: "concrete" },
    });

    const v = new Validator([g]);

    const ast = new AST.SyntaxTree({
      language: "emptyNodes",
      name: "r",
    });

    expect(v.validateFromRoot(ast).isValid).toBe(true);
    expect(v.getGrammarValidator("emptyNodes")).toBeTruthy();
  });

  it("Empty Tree", () => {
    const v = new Validator([langStringConstraint]);

    const ast = new AST.SyntaxTree(undefined);
    const res = v.validateFromRoot(ast);
    expect(res.errors.map((e) => e.code)).toEqual([ErrorCodes.Empty]);
  });

  it("String Constraints (Valid)", () => {
    const v = new Validator([langStringConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "string-constraint",
      name: "root",
      properties: {
        len: "1",
        min: "12",
        max: "12",
        enum: "a",
        regex: "A",
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it("String Constraints (Invalid)", () => {
    const v = new Validator([langStringConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "string-constraint",
      name: "root",
      properties: {
        len: "12",
        min: "1",
        max: "123",
        enum: "d",
        regex: "_A",
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(5);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalPropertyType);
    expect(res.errors[0].data.condition).toEqual("2 != 1");
    expect(res.errors[1].code).toEqual(ErrorCodes.IllegalPropertyType);
    expect(res.errors[1].data.condition).toEqual("1 < 2");
    expect(res.errors[2].code).toEqual(ErrorCodes.IllegalPropertyType);
    expect(res.errors[2].data.condition).toEqual("3 > 2");
    expect(res.errors[3].code).toEqual(ErrorCodes.IllegalPropertyType);
    expect(res.errors[3].data.condition).toEqual(`"d" in ["a","b","c"]`);
    expect(res.errors[4].code).toEqual(ErrorCodes.IllegalPropertyType);
    expect(res.errors[4].data.condition).toEqual(
      `"_A" did not match regular expression "^[a-zA-Z][a-zA-Z0-9_]*$"`
    );
  });

  it("Integer value is incorrectly an actual integer (must be string)", () => {
    const v = new Validator([langIntegerConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "integer-constraint",
      name: "root",
      properties: {
        minInclusive: "1",
        maxInclusive: "1",
      },
    };

    astDesc.properties["minInclusive"] = 1 as any;
    astDesc.properties["maxInclusive"] = "asdf" as any;

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
  });

  it("Integer Constraints (Valid)", () => {
    const v = new Validator([langIntegerConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "integer-constraint",
      name: "root",
      properties: {
        minInclusive: "1",
        maxInclusive: "1",
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it("Integer Constraints (Invalid)", () => {
    const v = new Validator([langIntegerConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "integer-constraint",
      name: "root",
      properties: {
        minInclusive: "0",
        maxInclusive: "2",
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
  });

  it("Boolean Constraint", () => {
    const v = new Validator([langBooleanConstraint]);

    const astDescTrue: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        foo: "true",
      },
    };

    const astTrue = new AST.SyntaxNode(astDescTrue, undefined);
    const resTrue = v.validateFromRoot(astTrue);
    expect(resTrue.isValid).toBeTruthy();

    const astDescFalse: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        foo: "false",
      },
    };

    const astFalse = new AST.SyntaxNode(astDescFalse, undefined);
    const resFalse = v.validateFromRoot(astFalse);
    expect(resFalse.isValid).toBeTruthy();

    const astDescInvalid: AST.NodeDescription = {
      language: "boolean-constraint",
      name: "root",
      properties: {
        foo: "foo",
      },
    };

    const astInvalid = new AST.SyntaxNode(astDescInvalid, undefined);
    const resInvalid = v.validateFromRoot(astInvalid);
    expect(resInvalid.errors.length).toEqual(1);
    expect(resInvalid.errors[0].code).toEqual(ErrorCodes.IllegalPropertyType);
  });

  it("Optional property missing", () => {
    const v = new Validator([langOptionalProperty]);
    const astDesc: AST.NodeDescription = {
      language: "optionalProperty",
      name: "root",
      properties: {
        required: "",
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.isValid).toBeTruthy();
  });

  it("Required property missing", () => {
    const v = new Validator([langOptionalProperty]);

    const astDesc: AST.NodeDescription = {
      language: "optionalProperty",
      name: "root",
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingProperty);
  });

  it("Invalid oneOf: oneOf node in AST", () => {
    const v = new Validator([langOneOfNodes]);

    const astDesc: AST.NodeDescription = {
      language: "oneof-nodes",
      name: "root",
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.TransientNode);
  });

  it("Invalid oneOf: No match", () => {
    const v = new Validator([langOneOfNodes]);

    const astDesc: AST.NodeDescription = {
      language: "oneof-nodes",
      name: "c",
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.UnexpectedType);
  });

  it("oneOf: allowsChildType() and validCardinality()", () => {
    const v = new Validator([langOneOfNodes]);

    const vRoot = v.availableTypes[0];
    const vNodeA = v.availableTypes[1];
    const vNodeB = v.availableTypes[2];
    const vNodeC = v.availableTypes[3];

    const tNodeA = { languageName: "oneof-nodes", typeName: "a" };
    const tNodeB = { languageName: "oneof-nodes", typeName: "b" };
    const tNodeC = { languageName: "oneof-nodes", typeName: "c" };
    const tNodeD = { languageName: "oneof-nodes", typeName: "d" };

    expect(vRoot.allowsChildType(tNodeA, "nodes")).toBeTruthy("a in root");
    expect(vRoot.allowsChildType(tNodeB, "nodes")).toBeTruthy("b in root");
    expect(vRoot.allowsChildType(tNodeC, "nodes")).toBeFalsy("c in root");
    expect(vRoot.allowsChildType(tNodeD, "nodes")).toBeFalsy("d in root");
    expect(vRoot.validCardinality("nodes")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });

    expect(vNodeA.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeA.allowsChildType(tNodeD, "nodes")).toBe(false);
    expect(vNodeA.validCardinality("nodes")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });

    expect(vNodeB.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeB.allowsChildType(tNodeD, "nodes")).toBe(false);
    expect(vNodeB.validCardinality("nodes")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });

    expect(vNodeC.allowsChildType(tNodeA, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeB, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeC, "nodes")).toBe(false);
    expect(vNodeC.allowsChildType(tNodeD, "nodes")).toBe(false);
    expect(vNodeC.validCardinality("nodes")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });
  });

  it('"sequence": validCardinality()', () => {
    const v = new Validator([langSequenceConstraint]);
    const vRoot = v.availableTypes[0];
    const vNodeA = v.availableTypes[1];
    const vNodeB = v.availableTypes[2];
    const vNodeC = v.availableTypes[3];

    expect(vRoot.validCardinality("nodes")).toEqual({
      minOccurs: 3,
      maxOccurs: 6,
    });
    expect(vRoot.validCardinality("nonexistant")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });

    expect(vNodeA.validCardinality("nonexistant")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });
    expect(vNodeB.validCardinality("nonexistant")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });
    expect(vNodeC.validCardinality("nonexistant")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });
  });

  it('"sequence": allowsChildType()', () => {
    const v = new Validator([langSequenceConstraint]);
    const vRoot = v.availableTypes[0];
    const vNodeA = v.availableTypes[1];
    const vNodeB = v.availableTypes[2];
    const vNodeC = v.availableTypes[3];

    const tNodeA = { languageName: "sequence-constraint", typeName: "a" };
    const tNodeB = { languageName: "sequence-constraint", typeName: "b" };
    const tNodeC = { languageName: "sequence-constraint", typeName: "c" };
    const tNodeD = { languageName: "sequence-constraint", typeName: "d" };

    expect(vRoot.allowsChildType(tNodeA, "nodes")).toBeTruthy();
    expect(vRoot.allowsChildType(tNodeB, "nodes")).toBeTruthy();
    expect(vRoot.allowsChildType(tNodeC, "nodes")).toBeTruthy();
    expect(vRoot.allowsChildType(tNodeD, "nodes")).toBeFalsy();

    expect(vNodeA.allowsChildType(tNodeA, "nodes")).toBeFalsy();
    expect(vNodeA.allowsChildType(tNodeB, "nodes")).toBeFalsy();
    expect(vNodeA.allowsChildType(tNodeC, "nodes")).toBeFalsy();
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

  it('Invalid single "sequence": Completely Empty', () => {
    const v = new Validator([langSingleSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "single-sequence-constraint",
      name: "root",
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.map((e) => e.code)).toEqual([ErrorCodes.MissingChild]);
  });

  it('Invalid single "sequence": Two items', () => {
    const v = new Validator([langSingleSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "single-sequence-constraint",
      name: "root",
      children: {
        nodes: [
          { language: "single-sequence-constraint", name: "a" },
          { language: "single-sequence-constraint", name: "a" },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.map((e) => e.code)).toEqual([ErrorCodes.SuperflousChild]);
  });

  it('Invalid single "sequence": Unexpected item', () => {
    const v = new Validator([langSingleSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "single-sequence-constraint",
      name: "root",
      children: {
        nodes: [{ language: "single-sequence-constraint", name: "root" }],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.map((e) => e.code)).toEqual([
      ErrorCodes.IllegalChildType,
    ]);
  });

  it('Invalid "sequence": Completely Empty', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(3);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a",
      },
      index: 0,
      category: "nodes",
    });
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a",
      },
      index: 1,
      category: "nodes",
    });
    expect(res.errors[2].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[2].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c",
      },
      index: 2,
      category: "nodes",
    });
  });

  it('Invalid "sequence": Only first required node', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "sequence-constraint",
            name: "a",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "a",
      },
      index: 1,
      category: "nodes",
    });
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c",
      },
      index: 2,
      category: "nodes",
    });
  });

  it('Invalid "sequence": Only first two required nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "a",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[0].data).toEqual({
      expected: {
        languageName: "sequence-constraint",
        typeName: "c",
      },
      index: 2,
      category: "nodes",
    });
  });

  it('Valid "sequence": Exact three required nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "c",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it('Valid "sequence": Three required nodes + Optional "b"-node', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "c",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it('Valid "sequence": Three required nodes + two optional "b"-nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "c",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it('Valid "sequence": Three required nodes + All optional "b"- and "c"-nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "c",
          },
          {
            language: "sequence-constraint",
            name: "c",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it('Invalid "sequence": Three required nodes + All optional "b"- and "c"-nodes + extra node', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "c",
          },
          {
            language: "sequence-constraint",
            name: "c",
          },
          {
            language: "sequence-constraint",
            name: "a",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.map((e) => e.code)).toEqual([ErrorCodes.SuperflousChild]);
  });

  it('Invalid "sequence": Three required nodes + three optional "b"-nodes', () => {
    const v = new Validator([langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "sequence-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "b",
          },
          {
            language: "sequence-constraint",
            name: "a",
          },
          {
            language: "sequence-constraint",
            name: "c",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
  });

  it('"allowed": validCardinality()', () => {
    const v = new Validator([langAllowedConstraint]);
    const vRoot = v.availableTypes[0];
    const vNodeA = v.availableTypes[1];
    const vNodeB = v.availableTypes[2];
    const vNodeC = v.availableTypes[3];

    expect(vRoot.validCardinality("nodes")).toEqual({
      minOccurs: 1,
      maxOccurs: Infinity,
    });
    expect(vRoot.validCardinality("nonexistant")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });

    expect(vNodeA.validCardinality("nonexistant")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });
    expect(vNodeB.validCardinality("nonexistant")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });
    expect(vNodeC.validCardinality("nonexistant")).toEqual({
      minOccurs: 0,
      maxOccurs: 0,
    });
  });

  it('"allowed": allowsChildType', () => {
    const v = new Validator([langAllowedConstraint]);
    const vRoot = v.getType({
      languageName: "allowed-constraint",
      typeName: "root",
    });
    const vNodeA = v.getType({
      languageName: "allowed-constraint",
      typeName: "a",
    });
    const vNodeB = v.getType({
      languageName: "allowed-constraint",
      typeName: "b",
    });
    const vNodeC = v.getType({
      languageName: "allowed-constraint",
      typeName: "c",
    });

    const tNodeA = { languageName: "allowed-constraint", typeName: "a" };
    const tNodeB = { languageName: "allowed-constraint", typeName: "b" };
    const tNodeC = { languageName: "allowed-constraint", typeName: "c" };
    const tNodeD = { languageName: "allowed-constraint", typeName: "d" };

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
        nodes: [],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
  });

  it('Valid "allowed": Required "c" node first', () => {
    const v = new Validator([langAllowedConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "allowed-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "allowed-constraint",
            name: "c",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it('Valid "allowed": All allowed nodes once', () => {
    const v = new Validator([langAllowedConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "allowed-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "allowed-constraint",
            name: "c",
          },
          {
            language: "allowed-constraint",
            name: "b",
          },
          {
            language: "allowed-constraint",
            name: "a",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(0);
  });

  it('Invalid "allowed": No "c" but too many "b"', () => {
    const v = new Validator([langAllowedConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "allowed-constraint",
      name: "root",
      children: {
        nodes: [
          {
            language: "allowed-constraint",
            name: "b",
          },
          {
            language: "allowed-constraint",
            name: "b",
          },
          {
            language: "allowed-constraint",
            name: "b",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.InvalidMaxOccurences);
    expect(res.errors[1].code).toEqual(ErrorCodes.InvalidMinOccurences);
  });

  it("Valid Choice (simple): a", () => {
    const v = new Validator([langSimpleChoice]);

    const astDesc: AST.NodeDescription = {
      language: "simpleChoice",
      name: "root",
      children: {
        nodes: [
          {
            language: "simpleChoice",
            name: "a",
          },
        ],
      },
    };

    const ast = new AST.SyntaxTree(astDesc);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it("Valid Choice (simple): b", () => {
    const v = new Validator([langSimpleChoice]);

    const astDesc: AST.NodeDescription = {
      language: "simpleChoice",
      name: "root",
      children: {
        nodes: [
          {
            language: "simpleChoice",
            name: "b",
          },
        ],
      },
    };

    const ast = new AST.SyntaxTree(astDesc);
    const res = v.validateFromRoot(ast);

    expect(res.errors).toEqual([]);
  });

  it("Invalid Choice (simple): c", () => {
    const v = new Validator([langSimpleChoice]);

    const astDesc: AST.NodeDescription = {
      language: "simpleChoice",
      name: "root",
      children: {
        nodes: [
          {
            language: "simpleChoice",
            name: "c",
          },
        ],
      },
    };

    const ast = new AST.SyntaxTree(astDesc);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.NoChoiceMatching);
  });

  it("Valid Choice: a, but a itself is not valid", () => {
    const v = new Validator([langSimpleChoice]);

    const astDesc: AST.NodeDescription = {
      language: "simpleChoice",
      name: "root",
      children: {
        nodes: [
          {
            language: "simpleChoice",
            name: "a",
            children: {
              tooMuch: [],
            },
          },
        ],
      },
    };

    const ast = new AST.SyntaxTree(astDesc);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.SuperflousChildCategory);
  });

  it("Valid Choice (complex): allowsChildType", () => {
    const v = new Validator([langComplexChoice]);

    const type_root = { languageName: "complexChoice", typeName: "root" };
    const type_a = { languageName: "complexChoice", typeName: "a" };
    const type_b = { languageName: "complexChoice", typeName: "b" };
    const type_c = { languageName: "complexChoice", typeName: "c" };
    const type_d = { languageName: "complexChoice", typeName: "d" };

    expect(v.getType(type_root).allowsChildType(type_a, "choice")).toBe(
      true,
      "root => a"
    );
    expect(v.getType(type_root).allowsChildType(type_b, "choice")).toBe(
      true,
      "root => b"
    );
    expect(v.getType(type_root).allowsChildType(type_c, "choice")).toBe(
      false,
      "root => c"
    );
    expect(v.getType(type_root).allowsChildType(type_d, "choice")).toBe(
      false,
      "root => d"
    );

    expect(v.getType(type_a).allowsChildType(type_a, "sequence")).toBe(
      false,
      "a => a"
    );
    expect(v.getType(type_a).allowsChildType(type_b, "sequence")).toBe(
      false,
      "a => b"
    );
    expect(v.getType(type_a).allowsChildType(type_c, "sequence")).toBe(
      true,
      "a => c"
    );
    expect(v.getType(type_a).allowsChildType(type_d, "sequence")).toBe(
      false,
      "a => d"
    );

    expect(v.getType(type_b).allowsChildType(type_a, "allowed")).toBe(
      false,
      "b => a"
    );
    expect(v.getType(type_b).allowsChildType(type_b, "allowed")).toBe(
      false,
      "b => b"
    );
    expect(v.getType(type_b).allowsChildType(type_c, "allowed")).toBe(
      true,
      "b => c"
    );
    expect(v.getType(type_b).allowsChildType(type_d, "allowed")).toBe(
      true,
      "b => d"
    );
  });

  it("Valid Choice (complex): sequence in a is too short", () => {
    const v = new Validator([langComplexChoice]);

    const astDesc: AST.NodeDescription = {
      language: "complexChoice",
      name: "root",
      children: {
        choice: [
          {
            language: "complexChoice",
            name: "c",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(1);
  });

  it("Validating tree of unknown language", () => {
    const v = new Validator([langAllowedConstraint, langSequenceConstraint]);

    const astDesc: AST.NodeDescription = {
      language: "nonexistant",
      name: "irrelevant",
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);

    const err = res.errors[0];
    expect(err.code).toEqual(ErrorCodes.UnknownRootLanguage);
    expect(err.data.requiredLanguage).toEqual(astDesc.language);
    expect(err.data.availableLanguages).toEqual([
      "allowed-constraint",
      "sequence-constraint",
    ]);
  });

  it("Mini-SQL: Empty SELECT query", () => {
    const v = new Validator([langMiniSql]);

    const astDesc: AST.NodeDescription = {
      language: "mini-sql",
      name: "query-select",
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(3, res);
    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[2].code).toEqual(ErrorCodes.MissingChild);
  });

  it("Mini-SQL: registers types", () => {
    const v = new Validator([langMiniSql]);

    expect(v.isKnownLanguage("mini-sql")).toBeTruthy();

    const allTypes = getQualifiedTypes(langMiniSql.types);
    allTypes.forEach((t) => {
      expect(v.isKnownType(t.languageName, t.typeName)).toBe(true);
    });
  });

  it("Mini-HTML: registers types", () => {
    const v = new Validator([langMiniHtml]);

    const allTypes = getQualifiedTypes(langMiniHtml.types);
    allTypes.forEach((t) => {
      expect(v.isKnownType(t.languageName, t.typeName)).toBe(true);
    });
  });

  it("Mini-HTML: empty", () => {
    const v = new Validator([langMiniHtml]);
    const res = v.validateFromRoot(undefined);

    expect(res.errors.length).toEqual(1);
  });

  it("Mini-HTML: superflous children", () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          { language: "mini-html", name: "head" },
          { language: "mini-html", name: "body" },
        ],
        superflous: [{ language: "mini-html", name: "mini-html" }],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);
    const res = v.validateFromRoot(ast);

    expect(res.errors.length).toEqual(1);
    expect(res.errors[0].code).toEqual(ErrorCodes.SuperflousChildCategory);
  });

  it("Mini-HTML: Empty document", () => {
    const v = new Validator([langMiniHtml]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(2, res);

    expect(res.errors[0].code).toEqual(ErrorCodes.MissingChild);
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
  });

  it("Mini-HTML: Minimal document", () => {
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
                    text: "Minimal",
                  },
                },
              ],
            },
          },
          { language: "mini-html", name: "body" },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(0, res);
  });

  it("Mini-HTML: Heading and paragraph", () => {
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
                  name: "heading",
                },
                {
                  language: "mini-html",
                  name: "paragraph",
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(0, res);
  });

  it("Mini-HTML: Invalid body (HTML again)", () => {
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
                  name: "html",
                },
              ],
            },
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.errors.length).toEqual(1, res);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalChildType);
    expect(JSON.stringify(res.errors[0].data)).toBeTruthy(
      "Should be pure data"
    );
  });

  it("Mini-HTML: Invalid single child (SQL query)", () => {
    const v = new Validator([langMiniHtml, langMiniSql]);

    const astDesc: AST.NodeDescription = {
      language: "mini-html",
      name: "html",
      children: {
        children: [
          {
            language: "mini-sql",
            name: "query-select",
          },
        ],
      },
    };

    const ast = new AST.SyntaxNode(astDesc, undefined);

    const res = v.validateFromRoot(ast);
    expect(res.isValid).toBeFalsy();
    expect(res.errors.length).toEqual(2);
    expect(res.errors[0].code).toEqual(ErrorCodes.IllegalChildType);
    expect(JSON.stringify(res.errors[0].data)).toBeTruthy(
      "Should be pure data"
    );
    expect(res.errors[1].code).toEqual(ErrorCodes.MissingChild);
    expect(JSON.stringify(res.errors[1].data)).toBeTruthy(
      "Should be pure data"
    );
  });

  describe(`References`, () => {
    const langRef = mkSingleLanguageGrammar("ref", "root", {
      root: {
        type: "concrete",
        attributes: [
          {
            name: "resRef",
            type: "property",
            base: "codeResourceReference",
          },
        ],
      },
    });

    it(`Marks a valid ID for check`, () => {
      const v = new Validator([langRef]);

      const astDesc: AST.NodeDescription = {
        language: "ref",
        name: "root",
        properties: {
          resRef: "35cbb311-c412-4af9-bafd-58c38e08e78b",
        },
      };

      const ast = new AST.SyntaxNode(astDesc, undefined);

      const res = v.validateFromRoot(ast);
      expect(res.errors).toEqual([]);
    });

    it(`Rejects an invalid ID and doesn't mark it for check`, () => {
      const v = new Validator([langRef]);

      const astDesc: AST.NodeDescription = {
        language: "ref",
        name: "root",
        properties: {
          resRef: "invalid",
        },
      };

      const ast = new AST.SyntaxNode(astDesc, undefined);

      const res = v.validateFromRoot(ast);
      expect(res.errors.map((e) => e.code)).toEqual([
        ErrorCodes.InvalidResourceId,
      ]);
    });
  });

  describe(`Root omitted`, () => {
    it(`No types present at all`, () => {
      const g: GrammarDocument = {
        types: {},
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
      };

      const v = new Validator([g]);

      const ast = new AST.SyntaxTree({ language: "l", name: "t" });
      const res = v.validateFromRoot(ast);
      expect(res.errors.map((e) => e.code)).toEqual([
        ErrorCodes.UnknownRootLanguage,
      ]);
    });

    it(`Relevant language present`, () => {
      const g: GrammarDocument = {
        types: {
          l: {},
        },
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
      };

      const v = new Validator([g]);

      const ast = new AST.SyntaxTree({ language: "l", name: "t" });
      const res = v.validateFromRoot(ast);
      expect(res.errors.map((e) => e.code)).toEqual([
        ErrorCodes.UnspecifiedRoot,
      ]);
    });

    it(`Relevant type present`, () => {
      const g: GrammarDocument = {
        types: {
          l: {
            t: {
              type: "concrete",
              attributes: [],
            },
          },
        },
        foreignTypes: {},
        visualisations: {},
        foreignVisualisations: {},
      };

      const v = new Validator([g]);

      const ast = new AST.SyntaxTree({ language: "l", name: "t" });
      const res = v.validateFromRoot(ast);
      expect(res.errors.map((e) => e.code)).toEqual([
        ErrorCodes.UnspecifiedRoot,
      ]);
    });
  });

  describe(`Container-related`, () => {
    describe(`Property in container`, () => {
      const g = mkSingleLanguageGrammar("g", "r", {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "property",
              base: "integer",
              name: "i1",
            },
          ],
        },
      });

      const v = new Validator([g]);

      it(`Tree missing property`, () => {
        const astDesc: AST.NodeDescription = {
          language: "g",
          name: "r",
        };

        const res = v.validateFromRoot(new AST.SyntaxNode(astDesc, undefined));
        expect(res.errors.map((e) => e.code)).toEqual([
          ErrorCodes.MissingProperty,
        ]);
      });

      it(`Tree with property`, () => {
        const astDesc: AST.NodeDescription = {
          language: "g",
          name: "r",
          properties: {
            i1: "0",
          },
        };

        const res = v.validateFromRoot(new AST.SyntaxNode(astDesc, undefined));
        expect(res.errors.map((e) => e.code)).toEqual([]);
      });
    });

    describe(`Childgroup in container`, () => {
      const g = mkSingleLanguageGrammar("g", "r", {
        r: {
          type: "concrete",
          attributes: [
            {
              type: "container",
              orientation: "horizontal",
              children: [
                {
                  type: "sequence",
                  name: "c",
                  nodeTypes: ["t1"],
                },
              ],
            },
          ],
        },
        t1: {
          type: "concrete",
        },
      });

      const v = new Validator([g]);

      it(`Tree missing childgroup`, () => {
        const astDesc: AST.NodeDescription = {
          language: "g",
          name: "r",
        };

        const res = v.validateFromRoot(new AST.SyntaxNode(astDesc, undefined));
        expect(res.errors.map((e) => e.code)).toEqual([
          ErrorCodes.MissingChild,
        ]);
      });

      it(`Tree with correct childgroup`, () => {
        const astDesc: AST.NodeDescription = {
          language: "g",
          name: "r",
          children: {
            c: [
              {
                language: "g",
                name: "t1",
              },
            ],
          },
        };

        const res = v.validateFromRoot(new AST.SyntaxNode(astDesc, undefined));
        expect(res.errors.map((e) => e.code)).toEqual([]);
      });

      it(`Tree with overful childgroup`, () => {
        const astDesc: AST.NodeDescription = {
          language: "g",
          name: "r",
          children: {
            c: [
              {
                language: "g",
                name: "t1",
              },
              {
                language: "g",
                name: "t1",
              },
            ],
          },
        };

        const res = v.validateFromRoot(new AST.SyntaxNode(astDesc, undefined));
        expect(res.errors.map((e) => e.code)).toEqual([
          ErrorCodes.SuperflousChild,
        ]);
      });
    });
  });

  describe(`Name-related`, () => {
    it(`Name clash: Property name "foo" defined twice`, () => {
      const g = mkSingleLanguageGrammar("spec", "root", {
        root: {
          type: "concrete",
          attributes: [
            { type: "property", base: "integer", name: "foo" },
            { type: "property", base: "integer", name: "foo" },
          ],
        },
      });

      expect(() => new Validator([g])).toThrowError(/foo/);
    });

    it(`Name clash: Child group name "foo" defined twice`, () => {
      const g = mkSingleLanguageGrammar("spec", "root", {
        root: {
          type: "concrete",
          attributes: [
            { type: "allowed", nodeTypes: [], name: "foo" },
            { type: "allowed", nodeTypes: [], name: "foo" },
          ],
        },
      });

      expect(() => new Validator([g])).toThrowError(/foo/);
    });

    it(`Auto generated property names for visual types`, () => {
      const g = mkSingleLanguageGrammar("spec", "root", {
        root: {
          type: "concrete",
          attributes: [
            { type: "terminal", symbol: "t" },
            { type: "container", orientation: "vertical", children: [] },
          ],
        },
      });

      expect(() => new Validator([g])).not.toThrow();
    });
  });

  describe(`foreignTypes related`, () => {
    it(`Single language, one type only foreign`, () => {
      const g: GrammarDocument = {
        types: {
          l: {
            t2: {
              type: "concrete",
              attributes: [],
            },
            t3: {
              type: "concrete",
              attributes: [],
            },
          },
        },

        foreignTypes: {
          l: {
            t1: {
              type: "concrete",
              attributes: [],
            },
            t2: {
              type: "concrete",
              attributes: [],
            },
          },
        },
        visualisations: {},
        foreignVisualisations: {},
      };

      const v = new Validator([g]);

      expect(v.isKnownLanguage("l")).withContext("g known").toBe(true);

      expect(v.isKnownType("l", "t1")).withContext("l.t1 known").toBe(true);
      expect(v.isKnownType("l", "t2")).withContext("l.t2 known").toBe(true);
      expect(v.isKnownType("l", "t3")).withContext("l.t3 known").toBe(true);
    });

    it(`Second language, only in foreign`, () => {
      const g: GrammarDocument = {
        types: {
          l1: {
            t1: {
              type: "concrete",
              attributes: [],
            },
            t2: {
              type: "concrete",
              attributes: [],
            },
          },
        },

        foreignTypes: {
          l2: {
            t1: {
              type: "concrete",
              attributes: [],
            },
            t2: {
              type: "concrete",
              attributes: [],
            },
          },
        },
        visualisations: {},
        foreignVisualisations: {},
      };

      const v = new Validator([g]);

      expect(v.isKnownLanguage("l1")).withContext("l1 known").toBe(true);
      expect(v.isKnownLanguage("l2")).withContext("l2 known").toBe(true);

      expect(v.isKnownType("l1", "t1")).withContext("l1.t1 known").toBe(true);
      expect(v.isKnownType("l1", "t2")).withContext("l1.t2 known").toBe(true);
      expect(v.isKnownType("l1", "t3"))
        .withContext("l1.t3 unknown")
        .toBe(false);

      expect(v.isKnownType("l2", "t1")).withContext("l2.t1 known").toBe(true);
      expect(v.isKnownType("l2", "t2")).withContext("l2.t2 known").toBe(true);
      expect(v.isKnownType("l2", "t3"))
        .withContext("l2.t3 unknown")
        .toBe(false);
    });
  });

  describe(`Visualisation`, () => {
    it(`Foreign type visualized`, () => {
      const g = mkGrammarDoc(
        { languageName: "g", typeName: "t1" },
        {
          types: {
            g: {
              t1: {
                type: "concrete",
                attributes: [
                  {
                    type: "property",
                    base: "integer",
                    name: "p1",
                  },
                ],
              },
            },
          },
          visualisations: {
            g: {
              t1: {
                type: "visualise",
                attributes: [],
              },
            },
          },
        }
      );

      const v = new Validator([g]);

      const astDesc: AST.NodeDescription = {
        language: "g",
        name: "t1",
      };

      const ast = new AST.SyntaxTree(astDesc);
      expect(comparableErrors(v.validateFromRoot(ast))).toEqual([
        { code: ErrorCodes.MissingProperty, location: [] },
      ]);
    });

    it(`Visualized type but no base type`, () => {
      const g = mkGrammarDoc(
        { languageName: "g", typeName: "t1" },
        {
          visualisations: {
            g: {
              t1: {
                type: "visualise",
                attributes: [],
              },
            },
          },
        }
      );

      const v = new Validator([g]);
      expect(v.availableTypes).toEqual([]);
    });
  });

  describe(`Multiple Languages in Single Grammar`, () => {
    it(`Two languages, same typename, no relation`, () => {
      const g = mkGrammarDoc(
        { languageName: "g", typeName: "t1" },
        {
          types: {
            g: {
              t1: {
                type: "concrete",
                attributes: [],
              },
            },
            h: {
              t1: {
                type: "concrete",
                attributes: [],
              },
            },
          },
        }
      );

      const v = new Validator([g]);

      expect(v.getGrammarValidator("g").rootType.description).toEqual({
        languageName: "g",
        typeName: "t1",
      });
      expect(v.getGrammarValidator("h").rootType.description).toEqual({
        languageName: "g",
        typeName: "t1",
      });

      expect(v.isKnownLanguage("g")).withContext("g known").toBe(true);
      expect(v.isKnownLanguage("h")).withContext("h known").toBe(true);
      expect(v.isKnownLanguage("n")).withContext("n known").toBe(false);

      expect(v.isKnownType("g", "t1")).withContext("g.t1 known").toBe(true);
      expect(v.isKnownType("g", "t2")).withContext("g.t2 known").toBe(false);

      expect(v.isKnownType("h", "t1")).withContext("h.t1 known").toBe(true);
      expect(v.isKnownType("h", "t2")).withContext("h.t2 known").toBe(false);

      const astDesc: AST.NodeDescription = {
        language: "g",
        name: "t1",
        children: {},
      };

      const ast = new AST.SyntaxTree(astDesc);
      expect(comparableErrors(v.validateFromRoot(ast))).toEqual([]);
    });

    it(`Two languages, same typename, g.t1 has h.t1 as child`, () => {
      const g = mkGrammarDoc(
        { languageName: "g", typeName: "t1" },
        {
          types: {
            g: {
              t1: {
                type: "concrete",
                attributes: [
                  {
                    type: "allowed",
                    name: "t1_c1",
                    nodeTypes: [
                      {
                        nodeType: { languageName: "h", typeName: "t1" },
                        occurs: "1",
                      },
                    ],
                  },
                ],
              },
            },
            h: {
              t1: {
                type: "concrete",
                attributes: [],
              },
            },
          },
        }
      );

      const v = new Validator([g]);

      expect(v.getGrammarValidator("g").rootType.description).toEqual({
        languageName: "g",
        typeName: "t1",
      });
      expect(v.getGrammarValidator("h").rootType.description).toEqual({
        languageName: "g",
        typeName: "t1",
      });

      expect(v.isKnownLanguage("g")).withContext("g known").toBe(true);
      expect(v.isKnownLanguage("h")).withContext("h known").toBe(true);
      expect(v.isKnownLanguage("n")).withContext("n known").toBe(false);

      expect(v.isKnownType("g", "t1")).withContext("g.t1 known").toBe(true);
      expect(v.isKnownType("g", "t2")).withContext("g.t2 known").toBe(false);

      expect(v.isKnownType("h", "t1")).withContext("h.t1 known").toBe(true);
      expect(v.isKnownType("h", "t2")).withContext("h.t2 known").toBe(false);

      const astDesc: AST.NodeDescription = {
        language: "g",
        name: "t1",
        children: {
          t1_c1: [
            {
              language: "h",
              name: "t1",
            },
          ],
        },
      };

      const ast = new AST.SyntaxTree(astDesc);
      const res = v.validateFromRoot(ast);
      expect(comparableErrors(res)).toEqual([]);
    });

    it(`Two types in two languages, root is typedef for either of them`, () => {
      const g = mkGrammarDoc(
        { languageName: "g", typeName: "root" },
        {
          types: {
            g: {
              root: {
                type: "oneOf",
                oneOf: [
                  { languageName: "g", typeName: "t1" },
                  { languageName: "h", typeName: "t1" },
                ],
              },
              t1: {
                type: "concrete",
                attributes: [],
              },
            },
            h: {
              t1: {
                type: "concrete",
                attributes: [],
              },
            },
          },
        }
      );

      const v = new Validator([g]);

      expect(v.getGrammarValidator("g").rootType.description).toEqual({
        languageName: "g",
        typeName: "root",
      });
      expect(v.getGrammarValidator("h").rootType.description).toEqual({
        languageName: "g",
        typeName: "root",
      });

      expect(v.isKnownLanguage("g")).withContext("g known").toBe(true);
      expect(v.isKnownLanguage("h")).withContext("h known").toBe(true);
      expect(v.isKnownLanguage("n")).withContext("n known").toBe(false);

      expect(v.isKnownType("g", "t1")).withContext("g.t1 known").toBe(true);
      expect(v.isKnownType("g", "t2")).withContext("g.t2 known").toBe(false);

      expect(v.isKnownType("h", "t1")).withContext("h.t1 known").toBe(true);
      expect(v.isKnownType("h", "t2")).withContext("h.t2 known").toBe(false);

      const validDescs: NodeDescription[] = [
        {
          language: "g",
          name: "t1",
        },
        {
          language: "h",
          name: "t1",
        },
      ];

      validDescs.forEach((astDesc) => {
        const ast = new AST.SyntaxTree(astDesc);
        const res = v.validateFromRoot(ast);
        expect(comparableErrors(res))
          .withContext(JSON.stringify(astDesc))
          .toEqual([]);
      });
    });
  });

  describe(`getType overloads`, () => {
    const gDesc = mkSingleLanguageGrammar("l", "r", {
      r: {
        type: "concrete",
        attributes: [],
      },
    });

    const g = new Validator([gDesc]).getGrammarValidator("l");

    it(`Works with a node that has an existing type`, () => {
      const n = new AST.SyntaxTree({
        language: "l",
        name: "r",
      }).rootNode;

      const resType: any = g.getType(n);
      const resParams: any = g.getType("l", "r");

      expect(resType).toBe(resParams);
    });

    it(`Throws on missing types`, () => {
      const n = new AST.SyntaxTree({
        language: "l",
        name: "nonexistant",
      }).rootNode;

      expect(() => {
        g.getType(n);
      }).toThrowError(/l\.nonexistant/);
    });
  });
});
