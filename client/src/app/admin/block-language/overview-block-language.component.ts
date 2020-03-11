import { Component, ViewChild, TemplateRef, OnInit } from "@angular/core";

import { ToolbarService } from '../../shared';
import { BlockLanguageDataService } from '../../shared/serverdata';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Observable } from 'rxjs';
import { BlockLanguageDescription, BlockLanguageListDescription } from '../../shared/block/block-language.description';
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
    private _serverData: BlockLanguageDataService,
    private _toolbarService: ToolbarService,
  ) { }

  ngOnInit(): void {
    this._toolbarService.addItem(this.toolbarItems);
  }

  readonly availableBlockLanguages: Observable<BlockLanguageListDescription[]> = this._serverData.list;
  readonly resultsLength = this._serverData.listTotalCount;

  public deleteBlockLanguage(id: string) {
    this._serverData.deleteBlockLanguage(id);
  }


  /**
  * User has requested a different chunk of data
  */
  onChangePagination() {
    this._serverData.setListPagination(this._paginator.pageSize, this._paginator.pageIndex);
  }

  /**
  * User has requested different sorting options
  */
  onChangeSort() {
    this._serverData.setListOrdering(this._sort.active as any, this._sort.direction);
  }

  displayedColumns: (keyof(BlockLanguageListDescription) |"generator"|"actions" |"grammar")[] = ["name", "slug", "id","grammar","actions","generator"];

}
