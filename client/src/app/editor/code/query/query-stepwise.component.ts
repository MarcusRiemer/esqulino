import { Component } from "@angular/core";

import { map, flatMap } from "rxjs/operators";
import { BehaviorSubject, combineLatest } from "rxjs";

import { stepwiseSqlQuery } from "../../../shared/syntaxtree/sql/sql-steps";
import { Tree } from "../../../shared/syntaxtree/";

import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { EditorToolbarService } from "../../toolbar.service";

import { QueryService } from "./query.service";

@Component({
  templateUrl: "templates/query-stepwise.html",
})
export class QueryStepwiseComponent {
  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _toolbarService: EditorToolbarService,
    private _queryService: QueryService
  ) {
    // TODO: Use _toolbarService to add navigation buttons
    // TODO: Remove created buttons on destroy, see ngOnDestroy in QueryPreviewComponent
    // HINT: Use font-awesome 4.7.0 icon classes
    this._toolbarService.addButton("foo", "foo", "house");
  }

  private _currentStep = new BehaviorSubject<number>(1);

  readonly codeResource$ = this._currentCodeResource.currentResource;

  readonly blockLanguage$ = this.codeResource$.pipe(
    flatMap((c) => c.blockLanguage)
  );

  readonly availableSteps$ = this._currentCodeResource.currentTree.pipe(
    map((t) => stepwiseSqlQuery(t))
  );

  readonly currentTree$ = combineLatest(
    this._currentStep,
    this.availableSteps$
  ).pipe(
    map(([stepNum, steps]) => {
      return new Tree(steps[stepNum].ast);
    })
  );

  readonly currentStep$ = combineLatest(
    this._currentStep,
    this.availableSteps$
  ).pipe(map(([stepNum, steps]) => steps[stepNum]));

  readonly currentResult$ = this.currentTree$.pipe(
    flatMap((t) => this._queryService.runArbitraryQuery(t.toModel(), {}))
  );
}
