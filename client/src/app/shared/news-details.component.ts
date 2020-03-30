import { ActivatedRoute } from "@angular/router";
import { Component, LOCALE_ID, Inject } from "@angular/core";

import { ServerDataService } from "./serverdata/server-data.service";

@Component({
  templateUrl: "./templates/news-details.html",
})
export class NewsDetailsComponent {
  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    private readonly _serverData: ServerDataService,
    private readonly _activeRoute: ActivatedRoute
  ) {}

  private readonly _id = this._activeRoute.snapshot.paramMap.get("newsId");

  readonly locale = this._localeId;
  readonly news = this._serverData.getUserNewsDetails.getDescription(this._id);
}
