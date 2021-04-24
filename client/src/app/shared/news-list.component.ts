import { Component } from "@angular/core";

import { FrontpageListNewsGQL } from "../../generated/graphql";
import { pluck } from "rxjs/operators";
import { CurrentLocaleService } from "../current-locale.service";

@Component({
  selector: "news-list",
  templateUrl: "./templates/news-list.html",
})
export class NewsListComponent {
  constructor(
    private readonly _currentLocale: CurrentLocaleService,
    private _newsGQL: FrontpageListNewsGQL
  ) {}

  readonly locale = this._currentLocale.localeId;

  readonly newsList$ = this._newsGQL
    .watch({
      // Angular may pass something nasty like "en-US"
      languages: [this.locale],
    })
    .valueChanges.pipe(pluck("data", "news", "nodes"));
}
