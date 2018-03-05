import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription'

import { CodeResource, Tree } from '../../../shared/syntaxtree';

import { CurrentCodeResourceService } from '../../current-coderesource.service';
import { ToolbarService, ToolbarItem } from '../../toolbar.service';

import { QueryService, QueryResult, QueryParamsDescription } from './query.service'

/**
 * Extracts the names of required query parameters out of a syntaxtree.
 */
function extractQueryParameterNames(tree: Tree) {
  const names = tree.getNodesOfType({ languageName: "sql", typeName: "parameter" })
    .map(n => n.properties['name']);

  // Apparently this is what `Array.uniq` looks like in Javascript
  return (Array.from(new Set(names)));
}

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
  public queryParameters: QueryParamsDescription = {};

  // The toolbar button that is added by this component
  private _btnRun: ToolbarItem = undefined;

  private _subscriptions: Subscription[] = [];

  // A code resource that is guaranteed to be a SQL query
  private _currentQuery = this._currentCodeResource.currentResource
    .filter(c => c.programmingLanguageIdPeek == "sql");

  // All parameters that are part of the current tree
  readonly queryParameterNames = this._currentQuery
    .flatMap(c => c.syntaxTree)
    .map(extractQueryParameterNames);

  /**
   * Register the "run"-button and automatic query execution.
   */
  ngOnInit() {
    // The "run" button
    this._btnRun = this._toolbarService.addButton("run", "Ausführen", "play", "r");
    this._btnRun.onClick.subscribe(_ => {
      this.queryInProgress = true;

      this._queryService.runArbitraryQuery(this._currentCodeResource.peekResource, this.requiredQueryParameters)
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
    const subResource = this._currentQuery
      .flatMap(c => c.validationResult)
      .subscribe(res => {
        if (res.isValid) {
          this._btnRun.fire();
        }
      });

    this._subscriptions.push(subResource);
  }

  /**
   * SQLite does not like it if unneeded query parameters are handed in.
   * @return The minimal set of required query parameters.
   */
  get requiredQueryParameters() {
    const toReturn: QueryParamsDescription = {};
    const names = extractQueryParameterNames(this._currentCodeResource.peekResource.syntaxTreePeek);

    names.forEach(name => {
      toReturn[name] = this.queryParameters[name]
    });

    return (toReturn);
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
   * Remove registered buttons and subscriptions
   */
  ngOnDestroy() {
    this._toolbarService.removeItem(this._btnRun.id);

    this._subscriptions.forEach(s => s.unsubscribe());
    this._subscriptions = [];
  }
}
