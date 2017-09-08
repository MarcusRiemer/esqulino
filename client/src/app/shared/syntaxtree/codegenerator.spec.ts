import { CodeGenerator, NodeConverterRegistration, CodeGeneratorProcess } from './codegenerator'
import { Node, NodeDescription } from './syntaxtree'

describe('Codegeneration', () => {
  it('Converters are registered correctly', () => {
    // Register a single (useless) converter
    const fooBar = { languageName: "foo", typeName: "bar" };
    const codeGen = new CodeGenerator([
      {
        type: fooBar,
        converter: { init: function(_: any, _1: any) { } }
      }
    ]);

    // Check whether this converter exist (and no others)
    expect(codeGen.hasConverter(fooBar)).toBeTruthy();
    expect(() => codeGen.getConverter({ languageName: "phantasy", typeName: "bar" })).toThrowError();
    expect(() => codeGen.getConverter({ languageName: "foo", typeName: "baz" })).toThrowError();

    // Ensure this type can't be re-registered.
    expect(() => codeGen.registerConverter(fooBar, undefined)).toThrowError();
  });

  it('XML: <foo></foo>', () => {
    const astDesc: NodeDescription = {
      language: "xml",
      name: "node",
      children: {

      },
      properties: {
        "name": "foo"
      }
    };

    const ast = new Node(astDesc, undefined);

    const nodeConverter: NodeConverterRegistration[] = [
      {
        type: { languageName: "xml", typeName: "node" },
        converter: {
          init: function(node: Node, process: CodeGeneratorProcess) {
            const name = node.nodeProperties['name'];
            process.addConvertedNode(0, `<${name}>`, node);
            return (["nodes"]);
          },
          finish: function(node: Node, process: CodeGeneratorProcess) {
            const name = node.nodeProperties['name'];
            process.addConvertedNode(0, `</${name}>`, node);
          }
        }
      }
    ];

    const codeGen = new CodeGenerator(nodeConverter);
    const result = codeGen.emit(ast);

    expect(result).toEqual("<foo>\n</foo>");
  });
});
