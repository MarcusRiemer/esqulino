import { executeMath, TransformationInput } from "./execute-math";

export interface StringResultStep {
  oldExpression: {
    left: string;
    right: string;
  };
  transform: TransformationInput;
  newExpression: {
    left: string;
    right: string;
  };
}

describe(`Execute math`, () => {
  it(`x + 1 = 2 | -1`, () => {
    const transforms: TransformationInput[] = [
      {
        operation: "-",
        expression: "1",
      },
    ];

    const result = executeMath({
      rootExpression: {
        left: "x+1",
        operation: "equals",
        right: "2",
      },
      transformationSteps: transforms,
    });

    const stringResult: StringResultStep[] = result.map((r) => ({
      newExpression: {
        left: r.newExpression.left.text(),
        right: r.newExpression.right.text(),
      },
      oldExpression: {
        left: r.oldExpression.left.text(),
        right: r.oldExpression.right.text(),
      },
      transform: r.transform,
    }));

    const exp: StringResultStep[] = [
      {
        newExpression: {
          left: "x",
          right: "1",
        },
        oldExpression: {
          left: "1+x",
          right: "2",
        },
        transform: transforms[0],
      },
    ];

    expect(stringResult).toEqual(exp);
  });
});
