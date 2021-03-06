import { TestBed } from "@angular/core/testing";
import { ApolloTestingController } from "apollo-angular/testing";

import { MayPerformDocument } from "../../../generated/graphql";

/**
 * Mocks the result of an expected `MayPerform` request.
 */
export function specExpectMayPerform(
  variables: Record<string, unknown> | "first",
  result: boolean
) {
  const testingController = TestBed.inject(ApolloTestingController);

  testingController
    .expectOne((op) => {
      if (op.query !== MayPerformDocument) {
        return false;
      }

      if (variables === "first") {
        return true;
      } else {
        return JSON.stringify(variables) === JSON.stringify(op.variables);
      }
    })
    .flush({
      data: {
        mayPerform: {
          perform: result,
        },
      },
    });
}
