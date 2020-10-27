import { Component, Inject, LOCALE_ID } from "@angular/core";

import { FrontpageListNewsGQL } from "../../generated/graphql";
import { pluck } from "rxjs/operators";

@Component({
  selector: "news-list",
  templateUrl: "./templates/news-list.html",
})
export class NewsListComponent {
  constructor(
    @Inject(LOCALE_ID)
    readonly locale: "de" | "en",
    private _newsGQL: FrontpageListNewsGQL
  ) {}

  readonly newsList$ = this._newsGQL
    .watch({
      languages: [this.locale],
    })
    .valueChanges.pipe(pluck("data", "news", "nodes"));
}
