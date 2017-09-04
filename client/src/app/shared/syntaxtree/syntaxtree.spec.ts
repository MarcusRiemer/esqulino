import { Node, NodeDescription } from './syntaxtree'

describe('AST: Basic Operations', () => {
  it('loads HTML trees with basic templating', () => {
    // <html>
    //   <head>
    //     <title>{{ page.title }}</title>
    //   </head>
    //   <body class="bg-black">
    //   </body>
    // </html>
    const desc: NodeDescription = {
      nodeFamily: "html",
      nodeName: "html",
      nodeChildren: {
        "children": [
          {
            nodeFamily: "html",
            nodeName: "head",
            nodeChildren: {
              "children": [
                {

                  nodeFamily: "html",
                  nodeName: "title",
                  nodeChildren: {
                    "children": [
                      {
                        nodeFamily: "templating",
                        nodeName: "interpolate",
                        nodeChildren: {
                          "children": [
                            {
                              nodeFamily: "templating",
                              nodeName: "varname",
                              nodeProperties: {
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
            nodeFamily: "html",
            nodeName: "body",
            nodeChildren: {
              "attributes": [
                {
                  nodeFamily: "html",
                  nodeName: "class",
                  nodeChildren: {
                    "children": [
                      {
                        nodeFamily: "html",
                        nodeName: "text",
                        nodeProperties: {
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

    // <html>
    expect(root.nodeName).toEqual("html", "<html> element");
    expect(root.nodeFamily).toEqual("html", "<html> family");
    expect(root.getChildrenCategory("children").length).toEqual(2, "<html> children");

    // <head>
    const head = root.getChildrenCategory("children")[0];
    expect(head.nodeName).toEqual("head", "<head> element");
    expect(head.nodeFamily).toEqual("html", "<head> family");
    expect(head.getChildrenCategory("children").length).toEqual(1, "<head> children");

    // <title>{{ page.title }}</title>
    const title = head.getChildrenCategory("children")[0];
    expect(title.nodeName).toEqual("title", "<title> element");
    expect(title.nodeFamily).toEqual("html", "<title> family");
    expect(title.getChildrenCategory("children").length).toEqual(1, "<title> children");

    // {{ page.title }}
    const titleInterpolate = title.getChildrenCategory("children")[0];
    expect(titleInterpolate.nodeName).toEqual("interpolate", "{{ page.title }} name");
    expect(titleInterpolate.nodeFamily).toEqual("templating", "{{ page.title }} family");
    expect(titleInterpolate.getChildrenCategory("children").length).toEqual(1, "{{ page.title }} children");

    // page.title
    const titleInterpolateVar = titleInterpolate.getChildrenCategory("children")[0];
    expect(titleInterpolateVar.nodeName).toEqual("varname", "{{ page.title }} var-name");
    expect(titleInterpolateVar.nodeFamily).toEqual("templating", "{{ page.title }} var-family");
    expect(titleInterpolateVar.getChildrenCategory("children").length).toEqual(0, "{{ page.title }} var-children");

    // <body>
    const body = root.getChildrenCategory("children")[1];
    expect(body.nodeName).toEqual("body", "<body> element");
    expect(body.nodeFamily).toEqual("html", "<body> family");
    expect(body.getChildrenCategory("children").length).toEqual(0, "<body> children");
    expect(body.getChildrenCategory("attributes").length).toEqual(1, "<body> attributes");

    // class="bg-black"
    const bodyClass = body.getChildrenCategory("attributes")[0];
    expect(bodyClass.nodeName).toEqual("class", "class='bg-black' attribute");
    expect(bodyClass.nodeFamily).toEqual("html", "class='bg-black' family");
    expect(bodyClass.getChildrenCategory("children").length).toEqual(1, "class='bg-black' children");

    const bodyClassText = bodyClass.getChildrenCategory("children")[0];
    expect(bodyClassText.nodeName).toEqual("text", "class='bg-black' attribute");
    expect(bodyClass.nodeFamily).toEqual("html", "class='bg-black' family");

  });
});
