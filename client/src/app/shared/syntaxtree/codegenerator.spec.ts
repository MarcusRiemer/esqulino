import { CodeGenerator } from './codegenerator'
import { Node, NodeDescription } from './syntaxtree'

describe('Codegeneration', () => {
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

    const codeGen = new CodeGenerator();
    const result = codeGen.emit(ast);
  });
});
