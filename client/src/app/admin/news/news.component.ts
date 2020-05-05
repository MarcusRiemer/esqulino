import { map } from "rxjs/operators";
import { Component, Inject, LOCALE_ID, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";

import { PerformDataService } from "../../shared/authorisation/perform-data.service";
import { ServerDataService } from "../../shared";
import { MultilingualString } from "../../shared/multilingual-string.description";
import { locales } from "../../shared/change-language.component";
import { ListGrammarDataService } from "../../shared/serverdata";
import { NewsDescription } from "../../shared/news.description";
import { MatSort } from "@angular/material/sort";
import { AdminListNewsDataService } from "../../shared/serverdata/news-data.service";
@Component({
  templateUrl: "./templates/news.html",
})
export class AdminNewsListComponent {
  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  constructor(
    @Inject(LOCALE_ID) readonly localeId: string,
    private readonly _serverData: ServerDataService,
    private _router: Router,
    private _active: ActivatedRoute,
    private _performData: PerformDataService,
    readonly news: AdminListNewsDataService
  ) {}

  readonly languages = locales;
  readonly editors = [
    { name: "single", description: "Einfacher Bearbeitungsmodus" },
    { name: "translation", description: "Übersetzungsmodus" },
  ];

  readonly performCreateData = this._performData.news.create();

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
  public getLanguagesFlags(text: MultilingualString): String[] {
    let toReturn = [];
    locales.forEach((val) => {
      if (text[val.token] !== undefined) toReturn.push(val.flag);
    });

    return toReturn;
  }

  public createNews(): void {
    this._router.navigate(["create"], { relativeTo: this._active });
  }

  public parseUTCDate(date: string) {
    let dateArr = date.split(" ");
    return Date.parse(dateArr[0] + " " + dateArr[1]);
  }

  displayedColumns: (keyof NewsDescription | "availableIn")[] = [
    "id",
    "title",
    "availableIn",
    "publishedFrom",
    "createdAt",
    "updatedAt",
  ];
}
