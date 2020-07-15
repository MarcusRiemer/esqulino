import { generateDefaultNode, generateSidebar } from "./sidebar";
import { AnySidebarDescription } from "./sidebar.description";
import { SidebarDescription } from "../block.description";

describe("Sidebar Default Node Generator", () => {
  it("Creates empty nodes for empty tyes", () => {
    const node = generateDefaultNode({
      type: "concrete",
      languageName: "g1",
      typeName: "t1",
    });

    expect(node).toEqual({ language: "g1", name: "t1" });
  });

  it("Creates nodes with all types of unrestricted attributes", () => {
    const node = generateDefaultNode({
      type: "concrete",
      languageName: "g1",
      typeName: "t1",
      attributes: [
        {
          type: "property",
          base: "boolean",
          name: "b",
        },
        {
          type: "property",
          base: "integer",
          name: "i",
        },
        {
          type: "property",
          base: "string",
          name: "s",
        },
      ],
    });

    expect(node).toEqual({
      language: "g1",
      name: "t1",
      properties: {
        b: "false",
        i: "0",
        s: "",
      },
    });
  });

  it("Creates nodes for types with all types child groups", () => {
    const node = generateDefaultNode({
      type: "concrete",
      languageName: "g1",
      typeName: "t1",
      attributes: [
        {
          type: "sequence",
          name: "seq",
          nodeTypes: [],
        },
        {
          type: "allowed",
          name: "alo",
          nodeTypes: [],
        },
        {
          type: "choice",
          name: "cho",
          choices: [],
        },
      ],
    });

    expect(node).toEqual({
      language: "g1",
      name: "t1",
      children: {
        seq: [],
        alo: [],
        cho: [],
      },
    });
  });

  it(`Sidebar generation passes fixed sidebars through`, () => {
    const sidebar: AnySidebarDescription = {
      type: "fixedBlocks",
      caption: "Fixed",
      categories: [],
    };

    const res = generateSidebar({}, sidebar);
    expect(res).toEqual(sidebar);
  });

  it(`Sidebar generation passes fixed sidebar categories through`, () => {
    const sidebar: AnySidebarDescription = {
      type: "generatedBlocks",
      caption: "Fixed",
      categories: [
        {
          type: "constant",
          categoryCaption: "Category",
          blocks: [],
        },
      ],
    };

    const exp: SidebarDescription = {
      type: "fixedBlocks",
      caption: "Fixed",
      categories: [
        {
          categoryCaption: "Category",
          blocks: [],
        },
      ],
    };

    const res = generateSidebar({ g1: {} }, sidebar);
    expect(res).toEqual(exp);
  });

  it(`Sidebar generation passes fixed blocks through`, () => {
    const sidebar: AnySidebarDescription = {
      type: "generatedBlocks",
      caption: "Fixed",
      categories: [
        {
          type: "mixed",
          categoryCaption: "Category",
          blocks: [
            {
              type: "constant",
              displayName: "constant g1.t1",
              defaultNode: {
                language: "g1",
                name: "t1",
              },
            },
          ],
        },
      ],
    };

    const exp: SidebarDescription = {
      type: "fixedBlocks",
      caption: "Fixed",
      categories: [
        {
          categoryCaption: "Category",
          blocks: [
            {
              displayName: "constant g1.t1",
              defaultNode: {
                language: "g1",
                name: "t1",
              },
            },
          ],
        },
      ],
    };

    const res = generateSidebar({ g1: {} }, sidebar);
    expect(res).toEqual(exp);
  });

  it(`Sidebar generation creates a mixture of fixed and generated blocks`, () => {
    const sidebar: AnySidebarDescription = {
      type: "generatedBlocks",
      caption: "Generated Sidebar",
      categories: [
        {
          type: "mixed",
          categoryCaption: "Generated Category",
          blocks: [
            {
              type: "generated",
              nodeType: { languageName: "g1", typeName: "t1" },
            },
            {
              type: "constant",
              displayName: "constant",
              defaultNode: { language: "g1", name: "t1" },
            },
          ],
        },
      ],
    };

    const exp: SidebarDescription = {
      type: "fixedBlocks",
      caption: "Generated Sidebar",
      categories: [
        {
          categoryCaption: "Generated Category",
          blocks: [
            { displayName: "t1", defaultNode: { language: "g1", name: "t1" } },
            {
              displayName: "constant",
              defaultNode: { language: "g1", name: "t1" },
            },
          ],
        },
      ],
    };

    const res = generateSidebar({ g1: { t1: { type: "concrete" } } }, sidebar);
    expect(res).toEqual(exp);
  });

  it(`Sidebar generation for purely generated categories`, () => {
    const sidebar: AnySidebarDescription = {
      type: "generatedBlocks",
      caption: "Generated Sidebar",
      categories: [
        {
          type: "generated",
          categoryCaption: "Generated Category",
          grammar: {
            g1: ["t1"],
          },
        },
      ],
    };

    const exp: SidebarDescription = {
      type: "fixedBlocks",
      caption: "Generated Sidebar",
      categories: [
        {
          categoryCaption: "Generated Category",
          blocks: [
            { displayName: "t1", defaultNode: { language: "g1", name: "t1" } },
          ],
        },
      ],
    };

    const res = generateSidebar({ g1: { t1: { type: "concrete" } } }, sidebar);
    expect(res).toEqual(exp);
  });
});
