import { Component, Inject, LOCALE_ID } from "@angular/core";

import { FrontpageListNewsGQL } from "../../generated/graphql";
import { map } from "rxjs/operators";

@Component({
  selector: "news-list",
  templateUrl: "./templates/news-list.html",
})
export class NewsListComponent {
  constructor(
    @Inject(LOCALE_ID)
    readonly locale: string,
    private _newsGQL: FrontpageListNewsGQL
  ) {}

  readonly newsList$ = this._newsGQL
    .watch()
    .valueChanges.pipe(map((response) => response.data.frontpageListNews.nodes));
}
