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
    expect(root.name).toEqual("html", "<html> element");
    expect(root.languageName).toEqual("html", "<html> family");
    expect(root.getChildrenInCategory("children").length).toEqual(2, "<html> children");

    // <head>
    const head = root.getChildrenInCategory("children")[0];
    expect(head.name).toEqual("head", "<head> element");
    expect(head.languageName).toEqual("html", "<head> family");
    expect(head.getChildrenInCategory("children").length).toEqual(1, "<head> children");

    // <title>{{ page.title }}</title>
    const title = head.getChildrenInCategory("children")[0];
    expect(title.name).toEqual("title", "<title> element");
    expect(title.languageName).toEqual("html", "<title> family");
    expect(title.getChildrenInCategory("children").length).toEqual(1, "<title> children");

    // {{ page.title }}
    const titleInterpolate = title.getChildrenInCategory("children")[0];
    expect(titleInterpolate.name).toEqual("interpolate", "{{ page.title }} name");
    expect(titleInterpolate.languageName).toEqual("templating", "{{ page.title }} family");
    expect(titleInterpolate.getChildrenInCategory("children").length).toEqual(1, "{{ page.title }} children");

    // page.title
    const titleInterpolateVar = titleInterpolate.getChildrenInCategory("children")[0];
    expect(titleInterpolateVar.name).toEqual("varname", "{{ page.title }} var-name");
    expect(titleInterpolateVar.languageName).toEqual("templating", "{{ page.title }} var-family");
    expect(titleInterpolateVar.getChildrenInCategory("children").length).toEqual(0, "{{ page.title }} var-children");

    // <body>
    const body = root.getChildrenInCategory("children")[1];
    expect(body.name).toEqual("body", "<body> element");
    expect(body.languageName).toEqual("html", "<body> family");
    expect(body.getChildrenInCategory("children").length).toEqual(0, "<body> children");
    expect(body.getChildrenInCategory("attributes").length).toEqual(1, "<body> attributes");

    // class="bg-black"
    const bodyClass = body.getChildrenInCategory("attributes")[0];
    expect(bodyClass.name).toEqual("class", "class='bg-black' attribute");
    expect(bodyClass.languageName).toEqual("html", "class='bg-black' family");
    expect(bodyClass.getChildrenInCategory("children").length).toEqual(1, "class='bg-black' children");

    const bodyClassText = bodyClass.getChildrenInCategory("children")[0];
    expect(bodyClassText.name).toEqual("text", "class='bg-black' attribute");
    expect(bodyClass.languageName).toEqual("html", "class='bg-black' family");

  });
});
