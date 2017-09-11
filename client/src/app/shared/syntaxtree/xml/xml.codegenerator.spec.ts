import { CodeGenerator, NodeConverterRegistration, CodeGeneratorProcess } from '../codegenerator'
import { Node, NodeDescription } from '../syntaxtree'

import { NODE_CONVERTER } from './xml.codegenerator'

function parseDom(input: string) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(input, "text/xml");

  // Find out whether the input was valid, sadly, this is horrible ...
  // See:
  //
  // How do I detect XML parsing errors when using
  // Javascript's DOMParser in a cross-browser way?
  // https://stackoverflow.com/questions/11563554/
  const errors = dom.getElementsByTagName("parsererror");
  expect(errors.length).toEqual(0, "Number of errors in document");

  return (dom);
}

describe('Language: XML (Codegen)', () => {
  it('<foo></foo>', () => {
    const astDesc: NodeDescription = {
      language: "xml",
      name: "node",
      properties: {
        "name": "foo"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    const domResult = parseDom(result);
    expect(domResult.documentElement.nodeName).toEqual('foo');
  });

  it('<foo bar="baz"></foo>', () => {
    const astDesc: NodeDescription = {
      language: "xml",
      name: "node",
      children: {
        "attributes": [
          {
            language: "xml",
            name: "attribute",
            properties: {
              "key": "bar",
              "value": "baz"
            }
          }
        ]
      },
      properties: {
        "name": "foo"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    const domResult = parseDom(result);
    const root = domResult.documentElement;
    expect(root.nodeName).toEqual('foo');
    expect(root.attributes['bar'].nodeName).toEqual('bar');
    expect(root.attributes['bar'].nodeValue).toEqual('baz');
  });

  it('<foo bar="1" baz="2"></foo>', () => {
    const astDesc: NodeDescription = {
      language: "xml",
      name: "node",
      children: {
        "attributes": [
          {
            language: "xml",
            name: "attribute",
            properties: {
              "key": "bar",
              "value": "1"
            }
          },
          {
            language: "xml",
            name: "attribute",
            properties: {
              "key": "baz",
              "value": "2"
            }
          }
        ]
      },
      properties: {
        "name": "foo"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    const domResult = parseDom(result);
    const root = domResult.documentElement;
    expect(root.nodeName).toEqual('foo');
    expect(root.attributes['bar'].nodeName).toEqual('bar');
    expect(root.attributes['bar'].nodeValue).toEqual('1');
    expect(root.attributes['baz'].nodeName).toEqual('baz');
    expect(root.attributes['baz'].nodeValue).toEqual('2');
  });

  it('<foo bar="baz"><child></child></foo>', () => {
    const astDesc: NodeDescription = {
      language: "xml",
      name: "node",
      children: {
        "attributes": [
          {
            language: "xml",
            name: "attribute",
            properties: {
              "key": "bar",
              "value": "baz"
            }
          }
        ],
        "nodes": [
          {
            language: "xml",
            name: "node",
            properties: {
              "name": "child"
            }
          }
        ]
      },
      properties: {
        "name": "foo"
      }
    };

    const ast = new Node(astDesc, undefined);
    const codeGen = new CodeGenerator(NODE_CONVERTER);
    const result = codeGen.emit(ast);

    const domResult = parseDom(result);
    const root = domResult.documentElement;
    expect(root.nodeName).toEqual('foo');
    expect(root.attributes['bar'].nodeName).toEqual('bar');
    expect(root.attributes['bar'].nodeValue).toEqual('baz');

    const child = root.childNodes[1];
    expect(child.nodeName).toEqual('child');
  });
});
