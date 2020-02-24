import { Component, Inject, LOCALE_ID } from "@angular/core";

import { ServerDataService } from './serverdata/server-data.service';

@Component({
  selector: 'news-list',
  templateUrl: './templates/news-list.html'
})
export class NewsListComponent {
  constructor(
    @Inject(LOCALE_ID)
    readonly locale: string,
    private _serverData: ServerDataService
  ) { }

  readonly newsList$ = this._serverData.newsListFrontpage.value;
}