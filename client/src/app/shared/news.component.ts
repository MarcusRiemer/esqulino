import { PerformDescription } from './may-perform.description';
import { Component, Inject, LOCALE_ID } from "@angular/core";

import { ServerDataService } from './serverdata/server-data.service';

@Component({
  selector: 'news-list',
  templateUrl: './templates/news.html'
})
export class NewsComponent {
  constructor(
    @Inject(LOCALE_ID)
    private readonly _localeId: string,
    private _serverData: ServerDataService
  ) {}

  readonly perform: PerformDescription = {
    resourceType: "News",
    policyAction: "create"
  }

  readonly userNewsList = this._serverData.getUserNewsList;
  readonly locale = this._localeId;
}