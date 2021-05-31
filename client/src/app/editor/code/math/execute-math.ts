import nerdamer from "nerdamer";
//import "nerdamer/algebra";

import { prettierCodeGeneratorFromGrammar } from "../../../shared/syntaxtree/codegenerator-prettier";
import {
  NamedLanguages,
  SyntaxTree,
  VisualisedLanguages,
} from "../../../shared";

interface Equation {
  left: nerdamer.Expression;
  right: nerdamer.Expression;
}

export interface ResultStep {
  oldExpression: Equation;
  transform: TransformationInput;
  newExpression: Equation;
}

export interface TransformationInput {
  operation: "+" | "-" | "−" | "*" | "×" | "/" | "÷";
  expression: string;
}

export interface ExecutionInput {
  rootExpression: {
    left: string;
    right: string;
    operation: "equals";
  };
  transformationSteps: TransformationInput[];
}

/**
 * Transforms an AST into something that nerdamer can understand by
 * pretty printing selected parts of the given AST.
 *
 * @param ast A valid AST without any missing properties or unexpected holes
 * @param nerdamerTypes A grammar that will transform the given AST into
 *                      something that nerdamer can digest.
 */
export function compileMath(
  ast: SyntaxTree,
  nerdamerTypes: NamedLanguages | VisualisedLanguages
): ExecutionInput {
  const leftAst = ast.rootNode.getChildInCategory("Left");
  const left = prettierCodeGeneratorFromGrammar(nerdamerTypes, leftAst);

  const rightAst = ast.rootNode.getChildInCategory("Right");
  const right = prettierCodeGeneratorFromGrammar(nerdamerTypes, rightAst);

  const astTransformExpressions = ast.rootNode.getChildrenInCategory(
    "Transforms"
  );
  const transformationSteps = astTransformExpressions.map((expr) => ({
    operation: expr.properties["Operation"] as any,
    expression: prettierCodeGeneratorFromGrammar(
      nerdamerTypes,
      expr.getChildInCategory("Expression")
    ),
  }));

  return {
    rootExpression: {
      left,
      right,
      operation: "equals",
    },
    transformationSteps,
  };
}

export function executeMath(input: ExecutionInput): ResultStep[] {
  const transformFunc = (
    current: Equation,
    step: TransformationInput
  ): Equation => {
    switch (step.operation) {
      case "+":
        return {
          left: (current.left as any).add(step.expression),
          right: (current.right as any).add(step.expression),
        };
      case "-":
      case "−":
        return {
          left: (current.left as any).subtract(step.expression),
          right: (current.right as any).subtract(step.expression),
        };
      case "*":
      case "×":
        return {
          left: (current.left as any).multiply(step.expression),
          right: (current.right as any).multiply(step.expression),
        };
      case "/":
      case "÷":
        return {
          left: (current.left as any).divide(step.expression),
          right: (current.right as any).divide(step.expression),
        };
      default:
        throw new Error(`Unknown nerdamer operation "${step.operation}"`);
    }
  };

  const root: Equation = {
    left: nerdamer(input.rootExpression.left),
    right: nerdamer(input.rootExpression.right),
  };

  let prev = root;
  const toReturn: ResultStep[] = [];
  input.transformationSteps.forEach((step) => {
    let next = transformFunc(prev, step);
    toReturn.push({
      newExpression: next,
      oldExpression: prev,
      transform: step,
    });

    prev = next;
  });

  return toReturn;
}
