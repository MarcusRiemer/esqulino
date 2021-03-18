import { NodeConverterRegistration } from "../codegenerator";
import {
  CodeGeneratorProcess,
  OutputSeparator,
} from "../codegenerator-process";
import { SyntaxNode } from "../syntaxtree";

/**
 * Converts `str` to camel case.
 * Based on https://stackoverflow.com/a/2970667.
 * @param str The string to convert.
 * @return Returns the camel cased string.
 */
function camelize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
    /\s+/.test(match)
      ? ""
      : index === 0
      ? match.toLowerCase()
      : match.toUpperCase()
  );
}

/**
 * An instance of this state is persisted between calls to the
 * existing converters.
 */
interface State {
  loopCounter: number;
  emitProgressCallbacks: boolean;
}

export const DEFAULT_STATE: State = {
  loopCounter: 0,
  emitProgressCallbacks: true,
};

export const PROGRAM_NODE_CONVERTER: NodeConverterRegistration[] = [
  {
    type: {
      languageName: "trucklino_program",
      typeName: "sensor",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        const sensorName = camelize(node.properties["type"]);
        process.addConvertedFragment("truck." + sensorName + "()", node);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "negateExpression",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment("!", node);
        node
          .getChildrenInCategory("expr")
          .forEach((c) => process.generateNode(c));
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "relationalOperator",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        const operators = {
          AND: "&&",
          OR: "||",
        };
        process.addConvertedFragment(
          operators[node.properties["operator"]],
          node
        );
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "booleanConstant",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment(node.properties["value"].toString(), node);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "booleanBinaryExpression",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment("(", node);
        node
          .getChildrenInCategory("lhs")
          .forEach((c) => process.generateNode(c));
        process.addConvertedFragment(" ", node);
        node
          .getChildrenInCategory("operator")
          .forEach((c) => process.generateNode(c));
        process.addConvertedFragment(" ", node);
        node
          .getChildrenInCategory("rhs")
          .forEach((c) => process.generateNode(c));
        process.addConvertedFragment(")", node);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "procedureCall",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        if (process.state.emitProgressCallbacks) {
          const invokeCallback = `truck._progress(${JSON.stringify(
            node.location
          )});`;
          process.addConvertedFragment(
            invokeCallback,
            node,
            OutputSeparator.NEW_LINE_AFTER
          );
        }

        process.addConvertedFragment("yield* truck.", node);
        process.addConvertedFragment(camelize(node.properties["name"]), node);
        process.addConvertedFragment("(", node);
        node.getChildrenInCategory("arguments").forEach((a, idx, arr) => {
          process.generateNode(a);
          if (idx !== arr.length - 1) {
            process.addConvertedFragment(", ", node);
          }
        });
        process.addConvertedFragment(
          ");",
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "if",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment("if (", node);
        node
          .getChildrenInCategory("pred")
          .forEach((c) => process.generateNode(c));
        process.addConvertedFragment(
          ") {",
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
        process.indent(() => {
          node
            .getChildrenInCategory("body")
            .forEach((c) => process.generateNode(c));
        });
        process.addConvertedFragment("}", node, OutputSeparator.NEW_LINE_AFTER);

        node
          .getChildrenInCategory("elseIf")
          .forEach((c) => process.generateNode(c));
        node
          .getChildrenInCategory("else")
          .forEach((c) => process.generateNode(c));
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "ifElseIf",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment("else if (", node);
        node
          .getChildrenInCategory("pred")
          .forEach((c) => process.generateNode(c));
        process.addConvertedFragment(
          ") {",
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
        process.indent(() => {
          node
            .getChildrenInCategory("body")
            .forEach((c) => process.generateNode(c));
        });
        process.addConvertedFragment("}", node, OutputSeparator.NEW_LINE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "ifElse",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment(
          "else {",
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
        process.indent(() => {
          node
            .getChildrenInCategory("body")
            .forEach((c) => process.generateNode(c));
        });
        process.addConvertedFragment("}", node, OutputSeparator.NEW_LINE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "loopFor",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        if (typeof process.state.loopCounter === "undefined") {
          process.state.loopCounter = DEFAULT_STATE.loopCounter;
        }
        const i = process.state.loopCounter++;
        process.addConvertedFragment(`for (let i${i} = 0; i${i} < `, node);
        process.addConvertedFragment("" + node.properties["times"], node);
        process.addConvertedFragment(
          `; i${i}++) {`,
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
        process.indent(() => {
          node
            .getChildrenInCategory("body")
            .forEach((c) => process.generateNode(c));
        });
        process.addConvertedFragment("}", node, OutputSeparator.NEW_LINE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "loopWhile",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment("while (", node);
        node
          .getChildrenInCategory("pred")
          .forEach((c) => process.generateNode(c));
        process.addConvertedFragment(
          ") {",
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
        process.indent(() => {
          process.addConvertedFragment(
            "yield* truck.doNothing();",
            node,
            OutputSeparator.NEW_LINE_AFTER
          );
          node
            .getChildrenInCategory("body")
            .forEach((c) => process.generateNode(c));
        });
        process.addConvertedFragment("}", node, OutputSeparator.NEW_LINE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "procedureParameter",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment(camelize(node.properties["name"]), node);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "procedureDeclaration",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        process.addConvertedFragment("truck.", node);
        process.addConvertedFragment(camelize(node.properties["name"]), node);
        process.addConvertedFragment(" = function*(", node);
        node.getChildrenInCategory("arguments").forEach((a, idx, arr) => {
          process.generateNode(a);
          if (idx !== arr.length - 1) {
            process.addConvertedFragment(", ", node);
          }
        });
        process.addConvertedFragment(
          ") {",
          node,
          OutputSeparator.NEW_LINE_AFTER
        );
        process.indent(() => {
          process.addConvertedFragment(
            "yield* truck.doNothing();",
            node,
            OutputSeparator.NEW_LINE_AFTER
          );
          node
            .getChildrenInCategory("body")
            .forEach((c) => process.generateNode(c));
        });
        process.addConvertedFragment("}", node, OutputSeparator.NEW_LINE_AFTER);
      },
    },
  },
  {
    type: {
      languageName: "trucklino_program",
      typeName: "program",
    },
    converter: {
      init: function (node: SyntaxNode, process: CodeGeneratorProcess<State>) {
        node
          .getChildrenInCategory("procedures")
          .forEach((c) => process.generateNode(c));
        if (node.getChildrenInCategory("procedures").length > 0) {
          process.addConvertedFragment(
            "",
            node,
            OutputSeparator.NEW_LINE_AFTER
          );
        }
        node
          .getChildrenInCategory("main")
          .forEach((c) => process.generateNode(c));
      },
    },
  },
];
