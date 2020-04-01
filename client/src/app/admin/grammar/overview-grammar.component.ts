import {Component, ViewChild} from "@angular/core";

import { GrammarListDescription } from "../../shared/syntaxtree";
import {
  ListGrammarDataService,
  MutateGrammarService,
} from "../../shared/serverdata";
import {MatSort} from "@angular/material/sort";

@Component({
  selector: "grammar-overview-selector",
  templateUrl: "./templates/overview-grammar.html",
  providers: [ListGrammarDataService],
})
export class OverviewGrammarComponent {
  readonly resultsLength$ = this.grammars.listTotalCount$;
  readonly availableGrammars$ = this.grammars.list;
  readonly inProgress = this.grammars.listCache.inProgress;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    readonly grammars: ListGrammarDataService,
    private _mutate: MutateGrammarService
  ) { }

  async onDeleteGrammar(id: string) {
    await this._mutate.deleteSingle(id);
  }

  /**
   * User wants to see a refreshed dataset.
   */
  onRefresh() {
    this.grammars.listCache.refresh();
  }

  displayedColumns: (keyof GrammarListDescription | "actions")[] = [
    "name",
    "slug",
    "id",
    "actions",
  ];
}
