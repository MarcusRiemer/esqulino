import { Component, ViewChild, TemplateRef, OnInit } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

import { ToolbarService } from "../../shared";
import { BlockLanguageListDescription } from "../../shared/block/block-language.description";
import {
  ListBlockLanguageDataService,
  MutateBlockLanguageService,
} from "../../shared/serverdata";

/**
 * Shows All block languages that are known to the server.
 */
@Component({
  templateUrl: "./templates/overview-block-language.html",
  providers: [ListBlockLanguageDataService],
})
export class OverviewBlockLanguageComponent implements OnInit {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  @ViewChild("toolbarItems", { static: true })
  toolbarItems: TemplateRef<any>;

  constructor(
    readonly blockLanguages: ListBlockLanguageDataService,
    private _mutate: MutateBlockLanguageService,
    private _toolbarService: ToolbarService
  ) {}

  ngOnInit(): void {
    this._toolbarService.addItem(this.toolbarItems);
  }


  async deleteBlockLanguage(id: string) {
    await this._mutate.deleteSingle(id);
  }

  /**
   * User wants to see a refreshed dataset.
   */
  onRefresh() {
    this.blockLanguages.listCache.refresh();
  }

  displayedColumns: (
    | keyof BlockLanguageListDescription
    | "generator"
    | "actions"
    | "grammar"
  )[] = ["name", "slug", "id", "grammar", "actions", "generator"];
}
