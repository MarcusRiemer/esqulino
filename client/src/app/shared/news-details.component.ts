import { ActivatedRoute } from "@angular/router";
import { Component } from "@angular/core";

import { pluck } from "rxjs/operators";

import { FrontpageSingleNewsGQL } from "../../generated/graphql";

import { CurrentLocaleService } from "../current-locale.service";

@Component({
  templateUrl: "./templates/news-details.html",
})
export class NewsDetailsComponent {
  constructor(
    private readonly _lang: CurrentLocaleService,
    private readonly _singleNewsGQL: FrontpageSingleNewsGQL,
    private readonly _activeRoute: ActivatedRoute
  ) {}

  private readonly _id = this._activeRoute.snapshot.paramMap.get("newsId");

  readonly locale = this._lang.localeId;
  readonly news$ = this._singleNewsGQL
    .watch({ id: this._id })
    .valueChanges.pipe(pluck("data", "news", "nodes", 0));
}
