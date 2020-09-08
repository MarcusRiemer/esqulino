import { Component } from "@angular/core";
import { Observable, of, combineLatest } from "rxjs";
import { switchMap, map } from "rxjs/operators";

import {
  RegexTestDescription,
  RegexTestCaseDescription,
} from "../../../shared/syntaxtree/regex/regex-task.description";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { runTestCase } from "../../../shared/syntaxtree/regex/regex-test";

export interface ExecutedTestCase extends RegexTestCaseDescription {
  matches: string[];
  result: boolean;
  error: string;
}

/**
 *
 */
@Component({
  templateUrl: "templates/regex-test.html",
})
export class RegexTestComponent {
  constructor(
    private readonly _currentCodeResource: CurrentCodeResourceService
  ) {}

  /**
   * The currently loaded regular expression.
   */
  readonly regexResource$ = this._currentCodeResource.currentResource;

  readonly regexCompiled$ = this.regexResource$.pipe(
    switchMap((res) => res.generatedCode)
  );

  /**
   * TODO: Follow reference as outlined by regex resource
   */
  readonly testCaseResource$ = this.regexResource$;

  /**
   * The testcases to execute
   */
  readonly test$: Observable<RegexTestDescription> = of({
    cases: [
      {
        input: "a",
        expected: {
          type: "exactMatch",
          hits: ["a"],
        },
      },
      {
        input: "abc",
        expected: { type: "wholeMatch" },
      },
      {
        input: "cd",
        expected: { type: "noMatch" },
      },
      {
        input: "abcde",
        expected: {
          type: "exactMatch",
          hits: ["abc", "de"],
        },
      },
    ],
  });

  checkIfExpectedHitGotMatched(expectedMatch: string, testCase: ExecutedTestCase) {
    return testCase.matches.find(x => x.trim() == expectedMatch.trim());
  }

  readonly executedTestCases$: Observable<ExecutedTestCase[]> = combineLatest(
    this.regexCompiled$,
    this.test$
  ).pipe(
    map(([regexString, testCases]) => {
      // TODO make sure this is only called on proper test code resources and not in for example a grammar defining code resource
      let regex;
      let errorMessage = "";
      try {
        regex  = new RegExp(regexString);
        console.log("regex: " + regexString);
      } catch (e) {
        errorMessage = e.message;
      }

      const toReturn: ExecutedTestCase[] = testCases.cases.map((testCase) => {
        // TODO Return the computed result instead of `true`
        if (errorMessage != "") {
          return Object.assign({}, {
            input: testCase.input,
            expected: testCase.expected,
            matches: [],
            result: false,
            error: errorMessage,
          });
        }
        return Object.assign({}, runTestCase(regex, testCase));
      });

      return toReturn;
    })
  );
}
