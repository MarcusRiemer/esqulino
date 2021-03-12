import { Node } from "./syntaxtree";
import {
  CodeConverterProvider,
  CodeGeneratorProcess,
  NodeConverter,
  OutputSeparator,
} from "./codegenerator-process";
import { QualifiedTypeName } from "./syntaxtree.description";

const SPEC_FAIL_PROVIDER: CodeConverterProvider = {
  getConverter(_: QualifiedTypeName): NodeConverter<any> {
    throw new Error(`This spec must not provide converters`);
  },
};

const SPEC_NODE = new Node(
  {
    language: "spec",
    name: "root",
  },
  undefined
);

describe(`Codegenerator Process`, () => {
  it(`Fragment joining`, () => {
    const fragments = [
      [
        { text: "<", depth: 0 },
        { text: "e", depth: 0 },
        { text: ">", depth: 0 },
        { text: "", depth: 0, sep: OutputSeparator.NEW_LINE_AFTER },
      ],
      [
        { text: "<", depth: 1 },
        { text: "c", depth: 1 },
        { text: ">", depth: 1 },
        { text: "", depth: 1, sep: OutputSeparator.NEW_LINE_AFTER },
        { text: "</", depth: 1 },
        { text: "c", depth: 1 },
        { text: ">", depth: 1 },
        { text: "", depth: 1, sep: OutputSeparator.NEW_LINE_AFTER },
      ],
      [
        { text: "</", depth: 0 },
        { text: "e", depth: 0 },
        { text: ">", depth: 0 },
        { text: "", depth: 0 },
      ],
    ];

    const process = new CodeGeneratorProcess(SPEC_FAIL_PROVIDER);

    fragments[0].forEach((f) =>
      process.addConvertedFragment(f.text, SPEC_NODE, f.sep)
    );

    process.indent(() => {
      fragments[1].forEach((f) =>
        process.addConvertedFragment(f.text, SPEC_NODE, f.sep)
      );
    });

    fragments[2].forEach((f) =>
      process.addConvertedFragment(f.text, SPEC_NODE, f.sep)
    );

    const res = process.emit();
    expect(res).toEqual("<e>\n  <c>\n  </c>\n</e>");
  });
});
