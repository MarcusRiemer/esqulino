import { FullNodeConcreteTypeDescription } from '../../syntaxtree/grammar-util.description'
import { defaultNode } from './sidebar'

describe("Sidebar Default Node Generator", () => {
  it("Properly creates empty nodes", () => {
    const node = defaultNode({
      type: "concrete",
      languageName: "g1",
      typeName: "t1"
    });

    expect(node).toEqual({ language: "g1", name: "t1", });
  });

  it("Properly creates nodes with all types of unrestricted attributes", () => {
    const node = defaultNode({
      type: "concrete",
      languageName: "g1",
      typeName: "t1",
      attributes: [
        {
          "type": "property",
          "base": "boolean",
          "name": "b"
        },
        {
          "type": "property",
          "base": "integer",
          "name": "i"
        },
        {
          "type": "property",
          "base": "string",
          "name": "s"
        }
      ]
    });

    expect(node).toEqual({
      language: "g1",
      name: "t1",
      properties: {
        "b": "false",
        "i": "0",
        "s": ""
      }
    });
  });

  it("Properly creates nodes for types with child groups", () => {
    const node = defaultNode({
      type: "concrete",
      languageName: "g1",
      typeName: "t1",
      attributes: [
        {
          "type": "sequence",
          "name": "seq",
          "nodeTypes": []
        },
        {
          "type": "allowed",
          "name": "alo",
          "nodeTypes": []
        },
        {
          "type": "choice",
          "name": "cho",
          "choices": []
        }
      ]
    });

    expect(node).toEqual({
      language: "g1",
      name: "t1",
      children: {
        "seq": [],
        "alo": [],
        "cho": []
      }
    });
  });
});