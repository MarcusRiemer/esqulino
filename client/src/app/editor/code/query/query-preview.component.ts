import { Component, Input, OnInit, OnDestroy } from '@angular/core';

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

  ngOnInit() {
    this._btnRun = this._toolbarService.addButton("run", "Ausführen", "play", "r");
    this._btnRun.onClick.subscribe(_ => {
      this._queryService.runArbitraryQuery(this._currentCodeResource.peekResource, {})
        .first()
        .subscribe(
        res => {
          this.result = res;
          this.error = undefined;
        },
        err => {
          this.result = undefined;
          this.error = err.json();
        });
    });
  }

  ngOnDestroy() {
    this._toolbarService.removeItem(this._btnRun.id);
  }
}
