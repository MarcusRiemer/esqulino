import { CodeGenerator, CodeGeneratorProcess } from './codegenerator'
import { Tree } from './syntaxtree'

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
  });

  it('Registering multiple converters for the same type is an error', () => {
    // Register a single (useless) converter
    const fooBar = { languageName: "foo", typeName: "bar" };
    const desc = [
      {
        type: fooBar,
        converter: { init: function(_: any, _1: any) { } }
      },
      {
        type: fooBar,
        converter: { init: function(_: any, _1: any) { } }
      }
    ];

    expect(_ => new CodeGenerator(desc)).toThrowError();
  });

  it('Fails properly for invalid nodes', () => {
    const codeGen = new CodeGenerator([]);
    const process = new CodeGeneratorProcess(codeGen);

    expect(_ => process.generateNode(undefined)).toThrowError();
  });

  it('Empty Tree', () => {
    const codeGen = new CodeGenerator([]);
    const tree = new Tree(undefined);

    expect(() => codeGen.emit(tree)).toThrowError();
  });
});
