import { Component } from "@angular/core";

import { map, flatMap, withLatestFrom, filter, pairwise } from "rxjs/operators";
import { BehaviorSubject, combineLatest } from "rxjs";

import { stepwiseSqlQuery } from "../../../shared/syntaxtree/sql/sql-steps";
import { Tree } from "../../../shared/syntaxtree/";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { EditorToolbarService, ToolbarItem } from "../../toolbar.service";

import { QueryResultRows, QueryService } from "./query.service";

/**
 * Controls the execution of database queries based on the current step
 */
@Component({
  templateUrl: "templates/query-stepwise.html",
})
export class QueryStepwiseComponent {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _toolbarService: EditorToolbarService,
    private _queryService: QueryService
  ) {}

  // To toolbar buttons that are added by this component
  private _btnPrev: ToolbarItem = undefined;
  private _btnNext: ToolbarItem = undefined;

  //holds the index for the current step to navigate though available steps
  private _currentStepNum = new BehaviorSubject<number>(0);

  readonly codeResource$ = this._currentCodeResource.currentResource;

  readonly blockLanguage$ = this.codeResource$.pipe(
    flatMap((c) => c.blockLanguage)
  );

  //all steps related to the initial query
  readonly availableSteps$ = this._currentCodeResource.currentTree.pipe(
    map((t) => stepwiseSqlQuery(t))
  );

  //tree for the current step
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

  //description for the current step
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

  //query result for the current step
  readonly currentResult$ = this.currentTree$.pipe(
    flatMap((t) => this._queryService.runArbitraryQuery(t.toModel(), {}))
    // ignore QueryResultError
  );

  //previous result that is used for visualiszation of grouping and condition filter
  //get the previous result by pairwise()[0] does not work when going back
  readonly prevResult$ = combineLatest(
    this._currentStepNum,
    this.availableSteps$
  ).pipe(
    filter(([stepNum]) => stepNum > 0),
    map(([stepNum, steps]) => {
      return steps[stepNum - 1];
    }),
    flatMap((step) =>
      this._queryService.runArbitraryQuery(new Tree(step.ast).toModel(), {})
    )
  );

  /**
   * Register the "back" and "forward"-buttons
   */
  ngOnInit() {
    // the "back" button for the previous step
    this._btnPrev = this._toolbarService.addButton(
      "back",
      "Zurück",
      "arrow-left"
    );
    // the "next" button for the next step
    this._btnNext = this._toolbarService.addButton(
      "forward",
      "Weiter",
      "arrow-right"
    );

    // update the current on "back" clicked
    this._btnPrev.onClick.subscribe((_) => {
      if (this._currentStepNum.value > 0) {
        this._currentStepNum.next(this._currentStepNum.value - 1);
      }
    });

    // update the current on "forward" clicked and prevent overflow
    this._btnNext.onClick
      .pipe(withLatestFrom(this.availableSteps$))
      .subscribe(([_, availableSteps]) => {
        if (this._currentStepNum.value < availableSteps.length - 1) {
          this._currentStepNum.next(this._currentStepNum.value + 1);
        }
      });
  }

  /**
   * Remove registered buttons
   */
  ngOnDestroy() {
    this._toolbarService.removeItem(this._btnPrev.id);
    this._toolbarService.removeItem(this._btnNext.id);
  }
}
