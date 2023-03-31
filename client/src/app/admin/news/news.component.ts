import { Component, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { MatLegacyPaginator as MatPaginator } from "@angular/material/legacy-paginator";
import { MatSort } from "@angular/material/sort";

import { BehaviorSubject } from "rxjs";

import {
  AdminListNewsGQL,
  AdminListNewsQuery,
} from "../../../generated/graphql";

import { PerformDataService } from "../../shared/authorisation/perform-data.service";
import { MultiLangString } from "../../shared/multilingual-string.description";
import { locales } from "../../shared/change-language.component";
import { CurrentLocaleService } from "../../current-locale.service";

// TODO: Should be beautified and used
type Query = ReturnType<AdminListNewsGQL["watch"]>;

type DataKey = Exclude<keyof AdminListNewsQuery, "__typename">;

// TODO: Resolve this from the Query type above, requires unpacking
//       a type argument to Observable
type ListItem = AdminListNewsQuery[DataKey]["nodes"][0];

type ColumnName = keyof ListItem;

@Component({
  templateUrl: "./templates/news.html",
})
export class AdminNewsListComponent {
  @ViewChild(MatPaginator)
  _paginator: MatPaginator;

  // Angular Material UI to sort by different columns
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(
    private readonly _lang: CurrentLocaleService,
    private readonly _router: Router,
    private readonly _active: ActivatedRoute,
    private readonly _performData: PerformDataService,
    private readonly _newsGQL: AdminListNewsGQL
  ) {}

  readonly languages = locales;
  readonly editors = [
    { name: "single", description: "Einfacher Bearbeitungsmodus" },
    { name: "translation", description: "Übersetzungsmodus" },
  ];

  readonly dataKey: DataKey = "news";

  displayedColumns: ColumnName[] = [
    "title",
    "text",
    "id",
    "publishedFrom",
    "createdAt",
    "updatedAt",
  ];

  filterColumns: ColumnName[] = ["title"];

  // mat-pagination info
  pageSize: number = 25;

  readonly performCreateData = this._performData.news.create();
  readonly query = this._newsGQL.watch(
    { first: this.pageSize },
    { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
  );

  public selectedLanguage: string = this._lang.localeId;
  public selectedEditor: string = "single";
  private _filter$ = new BehaviorSubject<string>("");
  //need searchFor to fire ngModelChange event
  public searchFor: string = "";

  public change($event): void {
    this._filter$.next($event);
  }

  /**
   * @param text the text of the current news
   */
  public getLanguagesFlags(text: MultiLangString): String[] {
    let toReturn = [];
    locales.forEach((val) => {
      if (text[val.token] !== undefined) toReturn.push(val.flag);
    });

    return toReturn;
  }

  public createNews(): void {
    this._router.navigate(["create"], { relativeTo: this._active });
  }

  public parseUTCDate(date: any) {
    return date;
  }

  get queryData() {
    return {
      query: this.query,
      dataKey: this.dataKey,
      displayColumns: this.displayedColumns,
      pageSize: this.pageSize,
      sort: this.sort,
      filterColumns: this.filterColumns,
      filterString$: this._filter$,
    };
  }
}
