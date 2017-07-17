import { LiquidRenderer } from './liquid'

import { Page, PageDescription } from '../page'

import {
  Paragraph, ParagraphDescription,
  Button, ButtonDescription,
  Column, ColumnDescription,
  Row, RowDescription,
  WidgetBase, WidgetDescription,
} from '../widgets/index'

const pageModel: PageDescription = {
  id: "1",
  name: "Render Test Page Model",
  apiVersion: "4",
  body: {
    type: "body",
    children: [

    ]
  }
}

/**
 * Testing the string representation of the rendered widget is possible,
 * but highly annoying. So all checks are made on the formalized XML
 * representation of the rendered widget. This especially avoids problems
 * with differing whitespace in the rendered output.
 */
function renderWidgetToXmlDom(w: WidgetBase): Element {
  let r = new LiquidRenderer();
  const resultDoc = new DOMParser().parseFromString(r.renderWidget(w), "text/html");
  return (resultDoc.body.children[0]);
}

/**
 * Checking for CSS classes is cumbersome with the DOM-interface, so this
 * helper method eases the pain.
 */
function expectCssClasses(node: Element, classes: [string]): void {
  const attr = node.attributes.getNamedItem("classes");
  if (!attr) {
    return;
  }

  // Comparision is far easier if things are sorted
  const givenClasses = classes.sort();

  // Gotta love javascript for this ... Arrays are compared by reference
  // per default:
  // "a d c b".split(" ").sort() == ["a", "b", "c", "d"] -> false
  //
  // But if one of the operands is a string ...
  // "a d c b".split(" ").sort() == "a,b,c,d" -> true
  //
  // But luckily jasmine know how to compare arrays in a meaningful fashion!
  const nodeClasses = attr.value.split(" ").sort();

  expect(givenClasses).toEqual(nodeClasses);
}

describe('Page Renderer: Liquid', () => {

  it('Paragraph', () => {
    const m: ParagraphDescription = {
      text: "Hello world",
      type: "paragraph"
    }

    const res = renderWidgetToXmlDom(new Paragraph(m));
    expect(res.nodeName).toEqual("P");
    expect(res.textContent).toEqual(m.text);
  });

  it('Button for navigation', () => {
    const m: ButtonDescription = {
      text: "Hello world",
      type: "button",
      navigate: {
        type: "navigate",
        external: "http://thedailywtf.com/articles/it-s-log-log-log"
      }
    }

    let page = new Page(pageModel);
    let b = new Button(m, page.body);

    const res = renderWidgetToXmlDom(b);

    expect(res.nodeName).toEqual("BUTTON");
    expect(res.textContent).toEqual(m.text);
    expect(res.attributes.getNamedItem("type").value).toEqual("submit");
  });

  it('Column', () => {
    const m: ColumnDescription = {
      type: "column",
      width: 6,
      widgets: []
    }

    const res = renderWidgetToXmlDom(new Column(m));

    expect(res.nodeName).toEqual(`DIV`);
    expectCssClasses(res, ["col-md-6"]);
  });

  it('Column with two paragraphs', () => {
    const mp1: ParagraphDescription = {
      text: "1",
      type: "paragraph"
    };

    const mp2: ParagraphDescription = {
      text: "2",
      type: "paragraph"
    };

    const m: ColumnDescription = {
      type: "column",
      width: 6,
      widgets: [mp1, mp2]
    }

    const res = renderWidgetToXmlDom(new Column(m));

    expect(res.nodeName).toEqual(`DIV`);
    expectCssClasses(res, ["col-md-6"]);
    expect(res.childNodes[0].nodeName).toEqual("P");
    expect(res.childNodes[0].textContent).toEqual(mp1.text);
    expect(res.childNodes[2].nodeName).toEqual("P");
    expect(res.childNodes[2].textContent).toEqual(mp2.text);
  });

  it('Row', () => {
    const m: RowDescription = {
      type: "row",
      columns: []
    }

    let row = new Row(m);
    let r = new LiquidRenderer();

    expect(r.renderWidget(row)).toEqual(`<div class="row"></div>`);
  });

  it('Row with two columns', () => {
    const m: RowDescription = {
      type: "row",
      columns: [
        {
          type: "column",
          width: 3,
          widgets: []
        },
        {
          type: "column",
          width: 7,
          widgets: []
        }
      ]
    }

    let row = new Row(m);
    let r = new LiquidRenderer();

    expect(r.renderWidget(row)).toEqual(`<div class="row"><div class="col-md-3"></div>\n<div class="col-md-7"></div></div>`);
  });
});
