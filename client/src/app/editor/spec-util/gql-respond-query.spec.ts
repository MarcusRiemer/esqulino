import { TestBed } from "@angular/core/testing";
import { Operation } from "@apollo/client/core";
import { ApolloTestingController, TestOperation } from "apollo-angular/testing";

export async function specGqlWaitQuery(
  opFilter: (m: Operation) => boolean,
  description = "Some GQL Query"
): Promise<TestOperation> {
  const testingController = TestBed.inject(ApolloTestingController);

  const checkHasOperation = () => {
    const results = testingController.match(opFilter);
    if (results.length === 1) {
      return results[0];
    } else if (results.length > 1) {
      throw new Error(
        `Got ${results.length} when trying to provide a single block language`
      );
    } else {
      return undefined;
    }
  };

  // Allow a little time to pass when trying to get the matching operation
  let operation: TestOperation = undefined;
  for (let i = 0; i < 10 && !operation; ++i) {
    operation = checkHasOperation();
    if (!operation) {
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  if (!operation) {
    throw new Error(`"${description}" got no matching request`);
  }

  return operation;
}
