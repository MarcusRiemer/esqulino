import { Node, NodeDescription, Tree } from './syntaxtree'

describe('AST: Basic Operations', () => {
  it('Node "all in one"-test', () => {
    // <html>
    //   <head>
    //     <title>{{ page.title }}</title>
    //   </head>
    //   <body class="bg-black">
    //   </body>
    // </html>
    const desc: NodeDescription = {
      language: "html",
      name: "html",
      children: {
        "children": [
          {
            language: "html",
            name: "head",
            children: {
              "children": [
                {

                  language: "html",
                  name: "title",
                  children: {
                    "children": [
                      {
                        language: "templating",
                        name: "interpolate",
                        children: {
                          "children": [
                            {
                              language: "templating",
                              name: "varname",
                              properties: {
                                "var": "page.title"
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
          },
          {
            language: "html",
            name: "body",
            children: {
              "attributes": [
                {
                  language: "html",
                  name: "class",
                  children: {
                    "children": [
                      {
                        language: "html",
                        name: "text",
                        properties: {
                          "value": "bg-black"
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
    };
    const root = new Node(desc, undefined);
    expect(root.tree).toBeUndefined();

    // <html>
    expect(root.typeName).toEqual("html", "<html> element");
    expect(root.languageName).toEqual("html", "<html> family");
    expect(root.getChildrenInCategory("children").length).toEqual(2, "<html> children");
    expect(root.hasChildren).toBeTruthy();

    // <head>
    const head = root.getChildrenInCategory("children")[0];
    expect(head.typeName).toEqual("head", "<head> element");
    expect(head.languageName).toEqual("html", "<head> family");
    expect(head.getChildrenInCategory("children").length).toEqual(1, "<head> children");
    expect(head.hasChildren).toBeTruthy();

    // <title>{{ page.title }}</title>
    const title = head.getChildrenInCategory("children")[0];
    expect(title.typeName).toEqual("title", "<title> element");
    expect(title.languageName).toEqual("html", "<title> family");
    expect(title.getChildrenInCategory("children").length).toEqual(1, "<title> children");
    expect(title.hasChildren).toBeTruthy();

    // {{ page.title }}
    const titleInterpolate = title.getChildrenInCategory("children")[0];
    expect(titleInterpolate.typeName).toEqual("interpolate", "{{ page.title }} name");
    expect(titleInterpolate.languageName).toEqual("templating", "{{ page.title }} family");
    expect(titleInterpolate.getChildrenInCategory("children").length).toEqual(1, "{{ page.title }} children");
    expect(titleInterpolate.hasChildren).toBeTruthy();

    // page.title
    const titleInterpolateVar = titleInterpolate.getChildrenInCategory("children")[0];
    expect(titleInterpolateVar.typeName).toEqual("varname", "{{ page.title }} var-name");
    expect(titleInterpolateVar.languageName).toEqual("templating", "{{ page.title }} var-family");
    expect(titleInterpolateVar.getChildrenInCategory("children").length).toEqual(0, "{{ page.title }} var-children");
    expect(titleInterpolateVar.hasChildren).toBeFalsy();

    // <body>
    const body = root.getChildrenInCategory("children")[1];
    expect(body.typeName).toEqual("body", "<body> element");
    expect(body.languageName).toEqual("html", "<body> family");
    expect(body.getChildrenInCategory("children").length).toEqual(0, "<body> children");
    expect(body.getChildrenInCategory("attributes").length).toEqual(1, "<body> attributes");
    expect(body.hasChildren).toBeTruthy();

    // class="bg-black"
    const bodyClass = body.getChildrenInCategory("attributes")[0];
    expect(bodyClass.typeName).toEqual("class", "class='bg-black' attribute");
    expect(bodyClass.languageName).toEqual("html", "class='bg-black' family");
    expect(bodyClass.getChildrenInCategory("children").length).toEqual(1, "class='bg-black' children");
    expect(bodyClass.hasChildren).toBeTruthy();

    const bodyClassText = bodyClass.getChildrenInCategory("children")[0];
    expect(bodyClassText.typeName).toEqual("text", "class='bg-black' attribute");
    expect(bodyClass.languageName).toEqual("html", "class='bg-black' family");
    expect(bodyClassText.hasChildren).toBeFalsy();

    // Reverting back to the model representation
    expect(root.toModel()).toEqual(desc);
  });

  it('Correctly finds parents', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "name",
      children: {
        "test": [
          { language: "lang", name: "c1" },
          { language: "lang", name: "c2" }
        ]
      }
    };
    const t = new Tree(treeDesc);

    expect(t.rootNode.tree).toEqual(t);
    expect(t.rootNode.children["test"][0].tree).toBe(t);
    expect(t.rootNode.children["test"][0].tree).toBe(t);

    expect(t.rootNode.nodeParent).toBeUndefined();
    expect(t.rootNode.children["test"][0].nodeParent).toBe(t.rootNode);
    expect(t.rootNode.children["test"][1].nodeParent).toBe(t.rootNode);
  });

  it('Correctly determines locations', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
          { language: "lang", name: "r_a_1" }
        ],
        "b": [
          {
            language: "lang",
            name: "r_b_0",
            children: {
              "c": [
                { language: "lang", name: "r_b_0_c_0" },
                { language: "lang", name: "r_b_0_c_1" }
              ],
              "d": [
                { language: "lang", name: "r_b_0_d_0" },
                { language: "lang", name: "r_b_0_d_1" }
              ]
            },
          },
        ]
      }
    };

    const t = new Tree(treeDesc);
    expect(t.rootNode.location).toEqual([]);
    expect(t.rootNode.children["a"][0].location).toEqual([["a", 0]]);
    expect(t.rootNode.children["a"][1].location).toEqual([["a", 1]]);
    expect(t.rootNode.children["b"][0].location).toEqual([["b", 0]]);
    expect(t.rootNode.children["b"][0].children["c"][0].location).toEqual([["b", 0], ["c", 0]]);
    expect(t.rootNode.children["b"][0].children["c"][1].location).toEqual([["b", 0], ["c", 1]]);
    expect(t.rootNode.children["b"][0].children["d"][0].location).toEqual([["b", 0], ["d", 0]]);
    expect(t.rootNode.children["b"][0].children["d"][1].location).toEqual([["b", 0], ["d", 1]]);
  });

  it('Correctly does lookups for locations', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
          { language: "lang", name: "r_a_1" }
        ],
        "b": [
          {
            language: "lang",
            name: "r_b_0",
            children: {
              "c": [
                { language: "lang", name: "r_b_0_c_0" },
                { language: "lang", name: "r_b_0_c_1" }
              ],
              "d": [
                { language: "lang", name: "r_b_0_d_0" },
                { language: "lang", name: "r_b_0_d_1" }
              ]
            },
          },
        ]
      }
    };

    const t = new Tree(treeDesc);
    expect(t.rootNode).toBe(t.locate([]));
    expect(t.rootNode.children["a"][0]).toBe(t.locate([["a", 0]]));
    expect(t.rootNode.children["a"][1]).toBe(t.locate([["a", 1]]));
    expect(t.rootNode.children["b"][0]).toBe(t.locate([["b", 0]]));
    expect(t.rootNode.children["b"][0].children["c"][0]).toBe(t.locate([["b", 0], ["c", 0]]));
    expect(t.rootNode.children["b"][0].children["c"][1]).toBe(t.locate([["b", 0], ["c", 1]]));
    expect(t.rootNode.children["b"][0].children["d"][0]).toBe(t.locate([["b", 0], ["d", 0]]));
    expect(t.rootNode.children["b"][0].children["d"][1]).toBe(t.locate([["b", 0], ["d", 1]]));
  });

  it('Throws on invalid locations', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
          { language: "lang", name: "r_a_1" }
        ],
        "b": [
          {
            language: "lang",
            name: "r_b_0",
            children: {
              "c": [
                { language: "lang", name: "r_b_0_c_0" },
                { language: "lang", name: "r_b_0_c_1" }
              ],
              "d": [
                { language: "lang", name: "r_b_0_d_0" },
                { language: "lang", name: "r_b_0_d_1" }
              ]
            },
          },
        ]
      }
    };

    const t = new Tree(treeDesc);
    expect(() => t.locate([["a", 2]])).toThrowError();
    expect(() => t.locate([["a", -1]])).toThrowError();
    expect(() => t.locate([["c", 0]])).toThrowError();
    expect(() => t.locate([["b", 0], ["a", 0]])).toThrowError();
  });

  it('Throws on nodes that have been removed', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
          { language: "lang", name: "r_a_1" }
        ]
      }
    };

    // Remove the whole category from the tree
    const t1 = new Tree(treeDesc);
    const node1 = t1.rootNode.children["a"][0];
    delete t1.rootNode.children["a"];
    expect(() => node1.location).toThrowError();

    // Remove all children of the category from the tree
    const t2 = new Tree(treeDesc);
    const node2 = t2.rootNode.children["a"][0];
    t2.rootNode.children["a"] = [];
    expect(() => node2.location).toThrowError();
  });

  it('Replaces the root', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
          { language: "lang", name: "r_a_1" }
        ]
      }
    };

    const prev = new Tree(treeDesc);
    const curr = prev.replaceNode([], { language: "r2", name: "r_new" });

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.languageName).toEqual("r2");
    expect(curr.rootNode.typeName).toEqual("r_new");
  });

  it('Replaces child nodes', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
          { language: "lang", name: "r_a_1" }
        ]
      }
    };

    const prev = new Tree(treeDesc);
    const curr = prev.replaceNode([["a", 0]], { language: "r2", name: "r_a_0_new" });

    expect(prev).not.toBe(curr);
    const changedNode = curr.locate([["a", 0]]);
    expect(changedNode.languageName).toEqual("r2");
    expect(changedNode.typeName).toEqual("r_a_0_new");
  });

  it('Chained replacement of nested child nodes', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          {
            language: "lang",
            name: "r_a_0",
            children: {
              "b": [
                { language: "lang", name: "r_a_0_b_0" },
                { language: "lang", name: "r_a_0_b_1" }
              ]
            }
          },
        ]
      }
    };

    const prev = new Tree(treeDesc);
    const curr = prev
      .replaceNode([["a", 0], ["b", 0]], { language: "r2", name: "r_a_0_b_0_new" })
      .replaceNode([["a", 0], ["b", 1]], { language: "r2", name: "r_a_0_b_1_new" });

    expect(prev).not.toBe(curr);
    const changedNode1 = curr.locate([["a", 0], ["b", 0]]);
    expect(changedNode1.languageName).toEqual("r2");
    expect(changedNode1.typeName).toEqual("r_a_0_b_0_new");

    const changedNode2 = curr.locate([["a", 0], ["b", 1]]);
    expect(changedNode2.languageName).toEqual("r2");
    expect(changedNode2.typeName).toEqual("r_a_0_b_1_new");
  });

  it('Replacing known properties', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      properties: {
        "a": "1",
        "b": "2"
      }
    };

    const prev = new Tree(treeDesc);
    const curr = prev.setProperty([], "a", "2");

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.properties["a"]).toEqual("2");
  });

  it('Setting new properties', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
    };

    const prev = new Tree(treeDesc);
    const curr = prev
      .setProperty([], "a", "1")
      .setProperty([], "b", "2");

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.properties["a"]).toEqual("1");
    expect(curr.rootNode.properties["b"]).toEqual("2");
  });

  it('Adding new properties', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
    };

    const prev = new Tree(treeDesc);
    const curr = prev
      .addProperty([], "a")
      .addProperty([], "b");

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.properties["a"]).toBeDefined();
    expect(curr.rootNode.properties["b"]).toBeDefined();
  });

  it('Error: Adding new duplicate properties', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      properties: {
        "a": "1"
      }
    };

    const prev = new Tree(treeDesc);
    expect(() => prev.addProperty([], "a")).toThrowError();
  });

  it('Renaming properties', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      properties: {
        "a": "1",
        "b": "2",
      }
    };

    const prev = new Tree(treeDesc);
    const curr = prev.renameProperty([], "a", "c");

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.properties["a"]).toBeUndefined();
    expect(curr.rootNode.properties["b"]).toEqual("2");
    expect(curr.rootNode.properties["c"]).toEqual("1");
  });

  it('Error: Renaming a non existant property', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      properties: {
        "a": "1",
        "b": "2",
      }
    };

    const prev = new Tree(treeDesc);
    expect(() => prev.renameProperty([], "c", "d")).toThrowError();
  });

  it('Error: Renaming to an existing property', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      properties: {
        "a": "1",
        "b": "2",
      }
    };

    const prev = new Tree(treeDesc);
    expect(() => prev.renameProperty([], "b", "a")).toThrowError();
  });

  it('Inserting nodes at the first index in existing categories', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
        ]
      }
    };

    const prev = new Tree(treeDesc);
    const curr = prev.insertNode([["a", 0]], { language: "lang", name: "new" });

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.children["a"].length).toEqual(2);
    expect(curr.rootNode.children["a"][0].typeName).toEqual("new");
    expect(curr.rootNode.children["a"][1].typeName).toEqual("r_a_0");
  });

  it('Inserting nodes at the last index in existing categories', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
        ]
      }
    };

    const prev = new Tree(treeDesc);
    const curr = prev.insertNode([["a", 1]], { language: "lang", name: "new" });

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.children["a"].length).toEqual(2);
    expect(curr.rootNode.children["a"][0].typeName).toEqual("r_a_0");
    expect(curr.rootNode.children["a"][1].typeName).toEqual("new");
  });

  it('Inserting nodes at the first index in new categories', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
      children: {
        "a": [
          { language: "lang", name: "r_a_0" },
        ]
      }
    };

    const prev = new Tree(treeDesc);
    const curr = prev.insertNode([["b", 0]], { language: "lang", name: "new" });

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.children["a"].length).toEqual(1);
    expect(curr.rootNode.children["a"][0].typeName).toEqual("r_a_0");
    expect(curr.rootNode.children["b"].length).toEqual(1);
    expect(curr.rootNode.children["b"][0].typeName).toEqual("new");
  });

  it('Inserting nodes into a parent that had no children', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r"
    };

    const prev = new Tree(treeDesc);
    const curr = prev.insertNode([["a", 0]], { language: "lang", name: "new" });

    expect(prev).not.toBe(curr);
    expect(curr.rootNode.children["a"].length).toEqual(1);
    expect(curr.rootNode.children["a"][0].typeName).toEqual("new");
  });

  it('Error: Inserting something at the root node', () => {
    const treeDesc: NodeDescription = {
      language: "lang",
      name: "r",
    };

    const prev = new Tree(treeDesc);
    expect(() => prev.insertNode([], { language: "lang", name: "new" })).toThrowError();
  });
});
