import {
  CodeGenerator,
  CodeGeneratorProcess,
  NodeConverterRegistration,
} from "./codegenerator";
import { Tree, Node } from "./syntaxtree";

describe("Codegeneration", () => {
  it("Converters are registered correctly", () => {
    // Register a single (useless) converter
    const fooBar = { languageName: "foo", typeName: "bar" };
    const codeGen = new CodeGenerator([
      {
        type: fooBar,
        converter: { init: function (_: any, _1: any) {} },
      },
    ]);

    // Check whether this converter exist (and no others)
    expect(codeGen.hasExplicitConverter(fooBar)).toBeTruthy();
    expect(() =>
      codeGen.getConverter({ languageName: "phantasy", typeName: "bar" })
    ).toThrowError();
    expect(() =>
      codeGen.getConverter({ languageName: "foo", typeName: "baz" })
    ).toThrowError();
  });

  it("Registering multiple converters for the same type is an error", () => {
    // Register a single (useless) converter
    const fooBar = { languageName: "foo", typeName: "bar" };
    const desc = [
      {
        type: fooBar,
        converter: { init: function (_: any, _1: any) {} },
      },
      {
        type: fooBar,
        converter: { init: function (_: any, _1: any) {} },
      },
    ];

    expect(() => new CodeGenerator(desc)).toThrowError();
  });

  it("Gives access to a mutable state", () => {
    interface State {
      foo: string;
      bar: number;
    }

    // The initial state that will be passed to the code generator
    const state: State = {
      foo: "foo",
      bar: 3,
    };

    // The state that has been passed to a converter
    let innerState = undefined;

    const desc: NodeConverterRegistration[] = [
      {
        type: { languageName: "foo", typeName: "bar" },
        converter: {
          init: function (_: Node, process: CodeGeneratorProcess<State>) {
            // Read and write the state
            process.state.bar += 1;
            process.state.foo += "bar";

            // Copy the inner state so it can be evaluated as part of the test
            innerState = process.state;
          },
        },
      },
    ];

    // Run the codegenerator
    const codeGen = new CodeGenerator(desc, [state]);
    const syntaxTree = new Node({ language: "foo", name: "bar" }, undefined);
    codeGen.emit(syntaxTree);

    // This is how the state must look if the mutations were applied correctly
    expect(innerState).toEqual({ foo: "foobar", bar: 4 });
    // The original state must remain unchanged
    expect(state).toEqual({ foo: "foo", bar: 3 });
  });

  it("Merges multiple states", () => {
    interface StateA {
      foo: string;
      bar: number;
    }

    interface StateB {
      count: number;
    }

    // The initial states that will be passed to the code generator
    const stateA: StateA = { foo: "foo", bar: 3 };
    const stateB: StateB = { count: 0 };

    // The state that has been passed to a converter
    let innerState = undefined;

    const desc: NodeConverterRegistration[] = [
      {
        type: { languageName: "foo", typeName: "bar" },
        converter: {
          init: function (
            _: Node,
            process: CodeGeneratorProcess<StateA & StateB>
          ) {
            // Read and write the state
            process.state.bar += 1;
            process.state.foo += "bar";
            process.state.count++;

            // Copy the inner state so it can be evaluated as part of the test
            innerState = process.state;
          },
        },
      },
    ];

    // Run the codegenerator
    const codeGen = new CodeGenerator(desc, [stateA, stateB]);
    const syntaxTree = new Node({ language: "foo", name: "bar" }, undefined);
    codeGen.emit(syntaxTree);

    // This is how the state must look if the mutations were applied correctly
    expect(innerState).toEqual({ foo: "foobar", bar: 4, count: 1 });
    // The original state must remain unchanged
    expect(stateA).toEqual({ foo: "foo", bar: 3 });
    expect(stateB).toEqual({ count: 0 });
  });

  it("Fails properly for invalid nodes", () => {
    const codeGen = new CodeGenerator([]);
    const process = new CodeGeneratorProcess(codeGen);

    expect(() => process.generateNode(undefined)).toThrowError();
  });

  it("Empty Tree", () => {
    const codeGen = new CodeGenerator([]);
    const tree = new Tree(undefined);

    expect(() => codeGen.emit(tree)).toThrowError();
  });
});
