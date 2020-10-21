import {Component} from "@angular/core";
import {Observable, combineLatest} from "rxjs";
import {switchMap, map, filter} from "rxjs/operators";

import {
    RegexTestBenchDescription,
    RegexTestCaseDescription,
    readFromNode,
} from "../../../shared/syntaxtree/regex/regex-testbench.description";
import {referencedResourceIds} from "../../../shared/syntaxtree/syntaxtree-util";
import {rxFilterRootLanguage} from "../../../shared/util";
import {runTestCase} from "../../../shared/syntaxtree/regex/regex-test";

import {CurrentCodeResourceService} from "../../current-coderesource.service";
import {ProjectService} from "../../project.service";

export interface ExecutedTestCase extends RegexTestCaseDescription {
    matches: string[];
    result: boolean;
    error: string;
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
    ) {
    }

    /**
     * The currently loaded regular expression.
     */
    readonly regexResource$ = this._currentCodeResource.currentResource.pipe(
        filter(rxFilterRootLanguage("regex"))
    );

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
    readonly test$: Observable<RegexTestBenchDescription[]> = this.regexResource$.pipe(
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
     * TODO rausfinden, wie ich das Observable hier holen kann um zu sortieren
     */
    // sortListDirectionaly() {
    //     let list = [];
    //     this.executedTestCases$.toPromise().then(function (res) {
    //         list = res.sort(function (a, b) {
    //             return Number(a.result) - Number(b.result);
    //         })
    //     });
    //
    //     return list;
    // }

    /**
     * counts the successfully hit strings for this testcase
     *
     * @param testCase
     */
    countSuccessfulHits(testCase: ExecutedTestCase) {
        if ('hits' in testCase.expected) {
            return testCase.matches.filter((x) => testCase.expected['hits'].find((y) => y.trim() == x.trim())).length;
        }
        return 0;
    }

    /**
     * return the count of expected hits for this testcase
     *
     * @param testCase
     */
    getExpectedHitCount(testCase: ExecutedTestCase) {
        if ('hits' in testCase.expected) {
            return testCase.expected.hits.length;
        }
        return 0;
    }

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
                        return Object.assign(
                            {},
                            {
                                input: testCase.input,
                                expected: testCase.expected,
                                matches: [],
                                result: false,
                                error: errorMessage,
                            }
                        );
                    } else {
                        return Object.assign({}, runTestCase(regex, testCase));
                    }
                });
            });

            return executed;
        })
    );
}
