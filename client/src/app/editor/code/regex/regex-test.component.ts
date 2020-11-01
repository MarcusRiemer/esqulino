import { Component } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { switchMap, map, filter, shareReplay } from "rxjs/operators";

import {
  RegexTestBenchDescription,
  readFromNode,
} from "../../../shared/syntaxtree/regex/regex-testbench.description";
import { referencedResourceIds } from "../../../shared/syntaxtree/syntaxtree-util";
import { rxFilterRootLanguage } from "../../../shared/util";
import {
  runTestCase,
  ExecutedTestCase,
} from "../../../shared/syntaxtree/regex/regex-test";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { ProjectService } from "../../project.service";

/**
 * Displays the results for various testcases that are associated with
 * the currently shown resource.
 */
@Component({
  templateUrl: "templates/regex-test.html",
})
export class RegexTestComponent {
  // scope variable that holds the current sorting direction of the table
  sortDirection = "none";

  /**
   * Constructor
   *
   * @param _currentCodeResource
   * @param _projectService
   */
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

  /**
   *
   */
  readonly regexCompiled$ = this.regexResource$.pipe(
    switchMap((res) => res.generatedCode)
  );

  /**
   * TODO: kann weg? ich sehe im Moment keinen Nutzen, verstehe TS aber auch nciht ganz
   */
  readonly testCaseResource$ = this.regexResource$;

  /**
   * The testcases to execute
   */
  readonly test$: Observable<
    RegexTestBenchDescription[]
  > = this.regexResource$.pipe(
    map((res) => {
      const p = this._projectService.cachedProject;
      const g = res.validatorPeek.getGrammarValidator("regex").description;
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

  /**
   * Checks whether a expected String matches the expected value from the testcase
   *
   * @param expectedMatch
   * @param testCase
   */
  checkIfExpectedHitGotMatched(
    expectedMatch: string,
    testCase: ExecutedTestCase
  ) {
    return testCase.matches.find((x) => x.trim() == expectedMatch.trim());
  }

  /**
   * changes the sorting direction according to it's current state
   */
  changeSortDirection() {
    switch (this.sortDirection) {
      case "none":
        this.sortDirection = "asc";
        break;
      case "asc":
        this.sortDirection = "desc";
        break;
      case "desc":
        this.sortDirection = "none";
        break;
      default:
        this.sortDirection = "none";
        break;
    }
  }

  /**
   *
   */
  readonly executedTestCases$: Observable<ExecutedTestCase[]> = combineLatest(
    this.regexCompiled$,
    this.test$
  ).pipe(
    map(([regexString, testCases]) => {
      // TODO make sure this is only called on proper test code resources and not in for example a grammar defining code resource
      let regex: RegExp;
      let errorMessage = "";
      try {
        regex = new RegExp(regexString);
      } catch (e) {
        errorMessage = e.message;
      }

      const executed: ExecutedTestCase[] = testCases.flatMap((bench) => {
        return bench.cases.map((testCase) => {
          if (errorMessage != "") {
            return {
              input: testCase.input,
              expected: testCase.expected,
              matches: [],
              result: false,
              error: errorMessage,
              countExpectedHits: 0,
              countSuccessfulHits: 0,
            };
          }
          return runTestCase(regex, testCase);
        });
      });

      return executed;
    }),
    shareReplay(1)
  );
}
