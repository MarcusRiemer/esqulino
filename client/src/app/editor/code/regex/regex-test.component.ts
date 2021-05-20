import { Component } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { switchMap, map, filter, mergeMap } from "rxjs/operators";

import {
  RegexTestBenchDescription,
  RegexTestCaseDescription,
  readFromNode,
} from "../../../shared/syntaxtree/regex/regex-testbench.description";
import { referencedResourceIds } from "../../../shared/syntaxtree/syntaxtree-util";
import { rxFilterRootLanguage } from "../../../shared/util";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { ProjectService } from "../../project.service";

interface ExecutedTestCase extends RegexTestCaseDescription {
  result: boolean;
}

/**
 * Displays the results for various testcases that are associated with
 * the currently shown resource.
 */
@Component({
  templateUrl: "templates/regex-test.html",
})
export class RegexTestComponent {
  constructor(
    private readonly _currentCodeResource: CurrentCodeResourceService,
    private readonly _projectService: ProjectService
  ) {}

  /**
   * The currently loaded regular expression.
   */
  readonly regexResource$ = this._currentCodeResource.currentResource.pipe(
    filter(rxFilterRootLanguage("regex"))
  );

  readonly regexCompiled$ = this.regexResource$.pipe(
    switchMap((res) => res.generatedCode$)
  );

  /**
   * TODO: Follow reference as outlined by regex resource
   */
  readonly testCaseResource$ = this.regexResource$;

  /**
   * The testcases to execute
   */
  readonly test$: Observable<RegexTestBenchDescription[]> =
    this.regexResource$.pipe(
      mergeMap(async (res) => {
        const p = this._projectService.cachedProject;
        const g = (await res.validatorPeek()).getGrammarValidator(
          "regex"
        ).description;
        const testRes = referencedResourceIds(
          res.syntaxTreePeek.rootNode,
          g,
          "codeResourceReference"
        );

        const testDocs = testRes.map((tId) => {
          const t = p.getCodeResourceById(tId);

          return readFromNode(t.syntaxTreePeek.rootNode);
        });

        return testDocs;
      })
    );

  readonly executedTestCases$: Observable<ExecutedTestCase[]> = combineLatest([
    this.regexCompiled$,
    this.test$,
  ]).pipe(
    map(([regexString, testCases]) => {
      const regex = new RegExp(regexString);
      // TODO: Compile and use regex for each testcase

      const toReturn: ExecutedTestCase[] = [];

      // We don't want to rely on array.float so we build the flattened array
      // by appending to it.
      testCases.forEach((t) => {
        t.cases.forEach((testCase) => {
          // TODO: Run testCase.input through regex and compare against expected result
          //       runTestCases in `regex-test.ts`
          //       Return the computed result instead of `true`
          toReturn.push(Object.assign({}, testCase, { result: true }));
        });
      });

      return toReturn;
    })
  );
}
