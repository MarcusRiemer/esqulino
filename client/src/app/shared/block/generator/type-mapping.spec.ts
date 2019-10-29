import { NodeConcreteTypeDescription, NodeAttributeDescription } from '../../syntaxtree/grammar.description'

import { VisualBlockDescriptions } from '../block.description';

import { mapTerminal, mapProperty, mapChildren, mapType, mapAttributes } from './type-mapping'
import { DefaultInstructions } from './instructions.description';
import { TypeInstructions } from './instructions';

describe("BlockLanguage Generator Type Mapping", () => {

  it("Terminal => Constant", () => {
    const res = mapTerminal(
      { type: "terminal", name: "t", symbol: "t" },
      { style: {}, breakAfter: true }
    );
    expect(res).toEqual({ blockType: "constant", text: "t", breakAfter: true });
  });

  it("Styled Terminal => Styled Constant", () => {
    const res = mapTerminal(
      { type: "terminal", name: "t", symbol: "t" },
      { style: { color: "green" }, breakAfter: false }
    );
    expect(res).toEqual(
      { blockType: "constant", text: "t", style: { color: "green" }, breakAfter: false },
    );
  });

  it("Writeable Property => Input", () => {
    const res = mapProperty(
      { type: "property", name: "prop", base: "string" },
      { propReadOnly: false, style: {} }
    );
    expect(res).toEqual({ blockType: "input", property: "prop" });
  });

  it("Readonly Property => Interpolated", () => {
    const res = mapProperty(
      { type: "property", name: "prop", base: "string" },
      { propReadOnly: true, style: {} }
    );
    expect(res).toEqual({ blockType: "interpolated", property: "prop" });
  });

  it("Sequence => Iterator", () => {
    const attrType: NodeAttributeDescription = {
      type: "sequence",
      name: "c1",
      nodeTypes: []
    };
    const nodeType: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [
        attrType
      ]
    };
    const res = mapChildren(nodeType, attrType, DefaultInstructions.iteratorInstructions);

    expect(res).toEqual([
      {
        blockType: "iterator",
        childGroupName: "c1",
        breakAfter: false,
        emptyDropTarget: false
      }
    ]);
  });

  it("Sequence (+Between) => Iterator", () => {
    const attrType: NodeAttributeDescription = {
      type: "sequence",
      name: "c1",
      nodeTypes: []
    };
    const nodeType: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [
        attrType
      ]
    };
    const res = mapChildren(
      nodeType, attrType,
      {
        between: "ä",
        style: {},
        breakAfter: false,
        emptyDropTarget: false,
      }
    );

    expect(res).toEqual([
      {
        blockType: "iterator",
        childGroupName: "c1",
        breakAfter: false,
        emptyDropTarget: false,
        between: [
          {
            blockType: "constant",
            text: "ä",
            style: DefaultInstructions.terminalInstructions.style,
            breakAfter: false
          }
        ]
      }
    ]);
  });

  it("Mentioned attributes only", () => {
    const instr = new TypeInstructions({
      blocks: [
        {
          attributeMapping: ["p1"]
        }
      ]
    });

    const concreteType: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [
        { type: "property", name: "ignored", base: "string" },
        { type: "terminal", name: "p1", symbol: "p1Text", },
      ]
    };
    const res = mapAttributes(concreteType, instr, 0);
    expect(res.length).toEqual(1);
  });

  it("Error Indicator (start)", () => {
    const instr = new TypeInstructions({
      blocks: [
        { generateErrorIndicator: "start" }
      ]
    });

    const concreteType: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [
        { type: "terminal", name: "p1", symbol: "p1Text", },
      ]
    };
    const res = mapType(concreteType, instr) as VisualBlockDescriptions.EditorBlock[];
    expect(res.length).toEqual(1);
    expect(res[0].blockType).toEqual("block");
    expect(res[0].children.length).toEqual(2);
    expect(res[0].children[0].blockType).toEqual("error");
    expect(res[0].children[1].blockType).toEqual("constant");
  });

  it("Error Indicator (end)", () => {
    const instr = new TypeInstructions({
      blocks: [
        { generateErrorIndicator: "end" }
      ]
    });

    const concreteType: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [
        { type: "terminal", name: "p1", symbol: "p1Text", },
      ]
    };
    const res = mapType(concreteType, instr) as VisualBlockDescriptions.EditorBlock[];
    expect(res.length).toEqual(1);
    expect(res[0].blockType).toEqual("block");
    expect(res[0].children.length).toEqual(2);
    expect(res[0].children[0].blockType).toEqual("constant");
    expect(res[0].children[1].blockType).toEqual("error");
  });

  it("Mentioning an unknown attribute", () => {
    const instr = new TypeInstructions({
      blocks: [
        {
          attributeMapping: ["missing"]
        }
      ]
    });

    const concreteType: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [
        { type: "property", name: "ignored", base: "string" },
        { type: "terminal", name: "p1", symbol: "p1Text", },
      ]
    };
    expect(() => mapAttributes(concreteType, instr, 0)).toThrowError();
  });
});

describe("Multi Block Types", () => {
  it("Identical relevant terminals with ignored property", () => {
    const instructions = new TypeInstructions({
      blocks: [
        { attributeMapping: ["p1"] },
        { attributeMapping: ["p1"] }
      ]
    });

    const concreteType: NodeConcreteTypeDescription = {
      type: "concrete",
      attributes: [
        {
          type: "property",
          name: "ignored",
          base: "string"
        },
        {
          type: "terminal",
          name: "p1",
          symbol: "p1Text",
        },
      ]
    }
    const res = mapType(concreteType, instructions) as VisualBlockDescriptions.EditorBlock[];
    expect(res.length).toEqual(2, "Two generated blocks");

    const expBlock = jasmine.objectContaining({
      blockType: "block",
    } as Partial<VisualBlockDescriptions.EditorBlock>);

    const expConstant = jasmine.objectContaining({
      blockType: "constant",
      text: "p1Text"
    } as Partial<VisualBlockDescriptions.EditorConstant>);

    res.forEach(b => {
      expect(b).toEqual(expBlock);
      expect(b.children.length).toEqual(2, "Error and a single child");
      expect(b.children[0]).toEqual(jasmine.objectContaining({ blockType: "error" } as Partial<VisualBlockDescriptions.EditorErrorIndicator>));
      expect(b.children[1]).toEqual(expConstant);
    });
  });
});
