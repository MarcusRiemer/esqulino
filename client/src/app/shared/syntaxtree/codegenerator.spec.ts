import { CodeGenerator } from './codegenerator'
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

    // Ensure this type can't be re-registered.
    expect(() => codeGen.registerConverter(fooBar, undefined)).toThrowError();
  });

  it('Empty Tree', () => {
    const codeGen = new CodeGenerator([]);
    const tree = new Tree(undefined);

    expect(() => codeGen.emit(tree)).toThrowError();
  });
});
