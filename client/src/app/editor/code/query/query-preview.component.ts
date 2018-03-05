import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription'

import { CodeResource } from '../../../shared/syntaxtree';

import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { ToolbarService, ToolbarItem } from '../../toolbar.service';

import { QueryService, QueryResult } from './query.service'

/**
 * Shows the results of a compiled SQL query.
 */
@Component({
  templateUrl: 'templates/query-preview.html',
})
export class QueryPreviewComponent implements OnInit, OnDestroy {

  constructor(
    private _currentCodeResource: CurrentCodeResourceService,
    private _toolbarService: ToolbarService,
    private _queryService: QueryService,
  ) {
  }

  public result: QueryResult;
  public error: any;

  private _btnRun: ToolbarItem = undefined;

  private _subscriptions: Subscription[] = [];

  /**
   * Register the "run"-button and automatic query execution.
   */
  ngOnInit() {
    // The "run" button
    this._btnRun = this._toolbarService.addButton("run", "Ausführen", "play", "r");
    this._btnRun.onClick.subscribe(_ => {
      this.queryInProgress = true;
      this._queryService.runArbitraryQuery(this._currentCodeResource.peekResource, {})
        .first()
        .finally(() => this.queryInProgress = false)
        .subscribe(
        res => {
          // Succesful query, store it and remove the error
          this.result = res;
          this.error = undefined;
        },
        err => {
          // Error in the query, display it "as is" for now.
          this.result = undefined;
          this.error = err.json();
        });
    });

    // Fire the query every time the ast changes into a valid tree.
    const subResource = this._currentCodeResource.currentResource
      .filter(c => c.programmingLanguageIdPeek == "sql")
      .flatMap(c => c.validationResult)
      .subscribe(res => {
        if (res.isValid) {
          this._btnRun.fire();
        }
      });

    this._subscriptions.push(subResource);
  }

  /**
   * @return True, if a query is currently in progress.
   */
  get queryInProgress() {
    return (this._btnRun.isInProgress);
  }

  /**
   * @param value True, if currently a query is in progress.
   */
  set queryInProgress(value: boolean) {
    this._btnRun.isInProgress = value;
  }

  /**
   * Remove registered buttons
   */
  ngOnDestroy() {
    this._toolbarService.removeItem(this._btnRun.id);
    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }
}
