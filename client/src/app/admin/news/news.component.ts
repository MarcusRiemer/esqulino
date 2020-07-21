import { map } from "rxjs/operators";
import { Component, Inject, LOCALE_ID, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { PerformDataService } from "../../shared/authorisation/perform-data.service";
import { ServerDataService } from "../../shared";
import { MultiLangString } from "../../shared/multilingual-string.description";
import { locales } from "../../shared/change-language.component";
import {
  AdminListNewsGQL,
  AdminListNewsQuery,
} from "../../../generated/graphql";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

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
    @Inject(LOCALE_ID) readonly localeId: string,
    private readonly _serverData: ServerDataService,
    private _router: Router,
    private _active: ActivatedRoute,
    private _performData: PerformDataService,
    private _newsGQL: AdminListNewsGQL
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

  // mat-pagination info
  pageSize: number = 25;

  readonly performCreateData = this._performData.news.create();
  readonly query = this._newsGQL.watch(
    { first: this.pageSize },
    { notifyOnNetworkStatusChange: true, fetchPolicy: "network-only" }
  );

  public adminNewsList = this._serverData.getAdminNewsList.value;
  public searchList = this.adminNewsList;
  public selectedLanguage: string = this.localeId;
  public selectedEditor: string = "single";
  public searchFor: string = "";

  public change(): void {
    this.searchList = this.adminNewsList;
    this.searchFor = this.searchFor.toLowerCase();
    this.searchList = this.searchList.pipe(
      map((item) =>
        item.filter(
          (entry) =>
            entry.id.includes(this.searchFor) ||
            (entry.text
              ? entry.text[this.selectedLanguage]
                ? entry.text[this.selectedLanguage]
                    .toLowerCase()
                    .includes(this.searchFor)
                : null
              : null) ||
            (entry.title
              ? entry.title[this.selectedLanguage]
                ? entry.title[this.selectedLanguage]
                    .toLowerCase()
                    .includes(this.searchFor)
                : null
              : null) ||
            (entry.publishedFrom ? entry.publishedFrom : null)
        )
      )
    );
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
    };
  }
}
