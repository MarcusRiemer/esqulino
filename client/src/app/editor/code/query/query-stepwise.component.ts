import { Component } from "@angular/core";

import { map, flatMap, withLatestFrom, filter, pairwise } from "rxjs/operators";
import { BehaviorSubject, combineLatest } from "rxjs";

import {
  SqlStepGroupByDescription,
  stepwiseSqlQuery,
} from "../../../shared/syntaxtree/sql/sql-steps";
import { Tree } from "../../../shared/syntaxtree/";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { EditorToolbarService, ToolbarItem } from "../../toolbar.service";

import { QueryResultRows, QueryService } from "./query.service";

@Component({
  templateUrl: "templates/query-stepwise.html",
})
export class QueryStepwiseComponent {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _toolbarService: EditorToolbarService,
    private _queryService: QueryService
  ) {}

  private _btnPrev: ToolbarItem = undefined;
  private _btnNext: ToolbarItem = undefined;

  private _currentStepNum = new BehaviorSubject<number>(0);

  readonly codeResource$ = this._currentCodeResource.currentResource;

  readonly blockLanguage$ = this.codeResource$.pipe(
    flatMap((c) => c.blockLanguage)
  );

  readonly availableSteps$ = this._currentCodeResource.currentTree.pipe(
    map((t) => stepwiseSqlQuery(t))
  );

  readonly currentTree$ = combineLatest(
    this._currentStepNum,
    this.availableSteps$
  ).pipe(
    map(([stepNum, steps]) => {
      return steps[Math.min(stepNum, steps.length - 1)];
    }),
    map((step) => {
      return new Tree(step.ast);
    })
  );

  readonly currentDescription$ = combineLatest(
    this._currentStepNum,
    this.availableSteps$
  ).pipe(
    map(([stepNum, steps]) => {
      return steps[Math.min(stepNum, steps.length - 1)];
    }),
    map((step) => {
      return step.description;
    })
  );

  readonly currentStep$ = combineLatest(
    this._currentStepNum,
    this.availableSteps$
  ).pipe(map(([stepNum, steps]) => steps[stepNum]));

  // ignore QueryResultError
  readonly currentResult$ = this.currentTree$.pipe(
    flatMap((t) => this._queryService.runArbitraryQuery(t.toModel(), {}))
    //tap(() => console.log("log query run"))
  );

  readonly groupByStepResult$ = this.currentStep$.pipe(
    filter((step) => step.description.type == "groupBy"),
    map((step) => <SqlStepGroupByDescription>step.description),
    flatMap((t) =>
      this._queryService.runArbitraryQuery(
        new Tree(t.correspondingOrderBy).toModel(),
        {}
      )
    ),
    filter((t) => t instanceof QueryResultRows)
  );

  // use previous result for visualiszation of condition filter
  readonly prevResult$ = this.currentResult$.pipe(
    pairwise(),
    map((pair) => pair[0])
  );

  ngOnInit() {
    this._btnPrev = this._toolbarService.addButton(
      "back",
      "Zurück",
      "arrow-left"
    );
    this._btnNext = this._toolbarService.addButton(
      "forward",
      "Weiter",
      "arrow-right"
    );

    this._btnPrev.onClick.subscribe((_) => {
      if (this._currentStepNum.value > 0) {
        console.log("button back");
        this._currentStepNum.next(this._currentStepNum.value - 1);
      } else {
        console.log("back not possible");
      }
    });

    this._btnNext.onClick
      .pipe(withLatestFrom(this.availableSteps$))
      .subscribe(([_, availableSteps]) => {
        if (this._currentStepNum.value < availableSteps.length - 1) {
          this._currentStepNum.next(this._currentStepNum.value + 1);
        }
      });
  }

  /**
   * Remove registered buttons and subscriptions
   */
  ngOnDestroy() {
    this._toolbarService.removeItem(this._btnPrev.id);
    this._toolbarService.removeItem(this._btnNext.id);
  }
}
