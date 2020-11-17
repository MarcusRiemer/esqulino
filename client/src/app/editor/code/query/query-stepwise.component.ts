import { Component } from "@angular/core";

import { map, flatMap, tap, withLatestFrom } from "rxjs/operators";
import { BehaviorSubject, combineLatest } from "rxjs";

import { stepwiseSqlQuery } from "../../../shared/syntaxtree/sql/sql-steps";
import { Tree } from "../../../shared/syntaxtree/";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { EditorToolbarService, ToolbarItem } from "../../toolbar.service";

import { QueryService, QueryResultRows, QueryResult } from "./query.service";
import { EditorComponentsService } from "../editor-components.service";

@Component({
  templateUrl: "templates/query-stepwise.html",
})
export class QueryStepwiseComponent {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _toolbarService: EditorToolbarService,
    private _queryService: QueryService
  ) //private _editorComponentsService: EditorComponentsService,
  {
    // TODO: Remove created buttons on destroy, see ngOnDestroy in QueryPreviewComponent
    // HINT: Use font-awesome 4.7.0 icon classes
    // this._toolbarService.addButton("foo", "foo", "house");
  }

  private _btnPrev: ToolbarItem = undefined;
  private _btnNext: ToolbarItem = undefined;
  public result: QueryResultRows;

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
      //this._currentCodeResource.peekResource.replaceSyntaxTree(step.ast);
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

  readonly currentResult$ = this.currentTree$.pipe(
    flatMap((t) => this._queryService.runArbitraryQuery(t.toModel(), {})),
    // ignore QueryResultError
   // map((r) => this.result = <QueryResultRows>r),
    tap(() => console.log("log query run"))
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

    this._btnPrev.onClick
      //.pipe(withLatestFrom(this.availableSteps$))
      .subscribe((_) => {
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

          console.log("button forward");
        } else {
          console.log("forward not possible");
        }
        /*if(this._currentStep.value >= availableSteps.length -1) {
        this._toolbarService.removeItem("forward");
      } */
      });
  }

  /**
   * Remove registered buttons and subscriptions
   */
  ngOnDestroy() {
    this._toolbarService.removeItem(this._btnPrev.id);
    this._toolbarService.removeItem(this._btnNext.id);

    //this._subscriptions.forEach((s) => s.unsubscribe());
    //this._subscriptions = [];
  }
}
