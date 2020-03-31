import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";

import { Observable } from "rxjs";

import { ListData } from "../serverdata";

export interface PaginationEvent {
  pageSize: number;
  pageIndex: number;
}

@Component({
  selector: "app-table-paginator",
  templateUrl: "./templates/paginator-table.html",
})
export class PaginatorTableComponent {
  // Angular Material UI to paginate
  @ViewChild(MatPaginator, { static: false })
  _paginator: MatPaginator;

  @Input()
  listData: ListData<any> = undefined;

  constructor() {}

  get resultsLength$() {
    return this.listData.listTotalCount$;
  }

  onChangePagination() {
    this.listData.setListPagination(
      this._paginator.pageSize,
      this._paginator.pageIndex
    );
  }
}
