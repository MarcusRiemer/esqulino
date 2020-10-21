import { ActivatedRoute } from "@angular/router";
import { Component, LOCALE_ID, Inject } from "@angular/core";

import { FrontpageSingleNewsGQL } from "../../generated/graphql";
import { pluck } from "rxjs/operators";

@Component({
  templateUrl: "./templates/news-details.html",
})
export class NewsDetailsComponent {
  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    private readonly _singleNewsGQL: FrontpageSingleNewsGQL,
    private readonly _activeRoute: ActivatedRoute
  ) {}

  private readonly _id = this._activeRoute.snapshot.paramMap.get("newsId");

  readonly locale = this._localeId;
  readonly news$ = this._singleNewsGQL
    .watch({ id: this._id })
    .valueChanges.pipe(pluck("data", "news", "nodes", 0));
}
