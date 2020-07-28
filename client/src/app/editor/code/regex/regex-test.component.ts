import { Component } from "@angular/core";
import { Observable, of, combineLatest } from "rxjs";
import { switchMap, map } from "rxjs/operators";

import {
  RegexTestDescription,
  RegexTestCaseDescription,
} from "../../../shared/syntaxtree/regex/regex-task.description";

import { CurrentCodeResourceService } from "../../current-coderesource.service";

interface ExecutedTestCase extends RegexTestCaseDescription {
  result: boolean;
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
        input: "ab",
        expected: { type: "wholeMatch" },
      },
      {
        input: "ba",
        expected: { type: "noMatch" },
      },
    ],
  });

  readonly executedTestCases$: Observable<ExecutedTestCase[]> = combineLatest(
    this.regexCompiled$,
    this.test$
  ).pipe(
    map(([regexString, testCases]) => {
      const regex = new RegExp(regexString);
      // TODO: Compile and use regex for each testcase

      const toReturn: ExecutedTestCase[] = testCases.cases.map((testCase) => {
        // TODO: Run testCase.input through regex and compare against expected result
        //       runTestCases in `regex-test.ts`
        //       Return the computed result instead of `true`
        return Object.assign({}, testCase, { result: true });
      });

      return toReturn;
    })
  );
}
