import { Component, ViewChild, TemplateRef, OnInit } from "@angular/core";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { ToolbarService } from '../../shared';
import { BlockLanguageListDescription } from '../../shared/block/block-language.description';
import { ListBlockLanguageDataService, MutateBlockLanguageService } from '../../shared/serverdata';


/**
 * Shows All block languages that are known to the server.
 */
@Component({
  templateUrl: './templates/overview-block-language.html'
})

export class OverviewBlockLanguageComponent implements OnInit {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort)
  _sort: MatSort;

  @ViewChild('toolbarItems', { static: true })
  toolbarItems: TemplateRef<any>;

  constructor(
    private _list: ListBlockLanguageDataService,
    private _mutate: MutateBlockLanguageService,
    private _toolbarService: ToolbarService,
  ) { }

  ngOnInit(): void {
    this._toolbarService.addItem(this.toolbarItems);
  }


  readonly resultsLength = this._list.peekListTotalCount;
  readonly availableBlockLanguages = this._list.listCache;

  public deleteBlockLanguage(id: string) {
    this._mutate.deleteSingle(id);
  }


  /**
  * User has requested a different chunk of data
  */
  onChangePagination() {
    this._list.setListPagination(this._paginator.pageSize, this._paginator.pageIndex);
  }

  /**
  * User has requested different sorting options
  */
  onChangeSort() {
    this._list.setListOrdering(this._sort.active as any, this._sort.direction);
  }

  displayedColumns: (keyof(BlockLanguageListDescription) |"generator"|"actions" |"grammar")[] = ["name", "slug", "id","grammar","actions","generator"];

}
