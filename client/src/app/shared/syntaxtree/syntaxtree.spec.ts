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

    // <html>
    expect(root.nodeName).toEqual("html", "<html> element");
    expect(root.nodeLanguage).toEqual("html", "<html> family");
    expect(root.getChildrenInCategory("children").length).toEqual(2, "<html> children");

    // <head>
    const head = root.getChildrenInCategory("children")[0];
    expect(head.nodeName).toEqual("head", "<head> element");
    expect(head.nodeLanguage).toEqual("html", "<head> family");
    expect(head.getChildrenInCategory("children").length).toEqual(1, "<head> children");

    // <title>{{ page.title }}</title>
    const title = head.getChildrenInCategory("children")[0];
    expect(title.nodeName).toEqual("title", "<title> element");
    expect(title.nodeLanguage).toEqual("html", "<title> family");
    expect(title.getChildrenInCategory("children").length).toEqual(1, "<title> children");

    // {{ page.title }}
    const titleInterpolate = title.getChildrenInCategory("children")[0];
    expect(titleInterpolate.nodeName).toEqual("interpolate", "{{ page.title }} name");
    expect(titleInterpolate.nodeLanguage).toEqual("templating", "{{ page.title }} family");
    expect(titleInterpolate.getChildrenInCategory("children").length).toEqual(1, "{{ page.title }} children");

    // page.title
    const titleInterpolateVar = titleInterpolate.getChildrenInCategory("children")[0];
    expect(titleInterpolateVar.nodeName).toEqual("varname", "{{ page.title }} var-name");
    expect(titleInterpolateVar.nodeLanguage).toEqual("templating", "{{ page.title }} var-family");
    expect(titleInterpolateVar.getChildrenInCategory("children").length).toEqual(0, "{{ page.title }} var-children");

    // <body>
    const body = root.getChildrenInCategory("children")[1];
    expect(body.nodeName).toEqual("body", "<body> element");
    expect(body.nodeLanguage).toEqual("html", "<body> family");
    expect(body.getChildrenInCategory("children").length).toEqual(0, "<body> children");
    expect(body.getChildrenInCategory("attributes").length).toEqual(1, "<body> attributes");

    // class="bg-black"
    const bodyClass = body.getChildrenInCategory("attributes")[0];
    expect(bodyClass.nodeName).toEqual("class", "class='bg-black' attribute");
    expect(bodyClass.nodeLanguage).toEqual("html", "class='bg-black' family");
    expect(bodyClass.getChildrenInCategory("children").length).toEqual(1, "class='bg-black' children");

    const bodyClassText = bodyClass.getChildrenInCategory("children")[0];
    expect(bodyClassText.nodeName).toEqual("text", "class='bg-black' attribute");
    expect(bodyClass.nodeLanguage).toEqual("html", "class='bg-black' family");

  });
});
