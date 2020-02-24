import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'

import { ServerDataService } from '../shared';

/**
 * The initial page a new user will see. Hosts a "best of" of landing-page
 * like content.
 */
@Component({
  templateUrl: 'templates/about.html',
})
export class AboutComponent implements OnInit {

  constructor(
    private _title: Title,
    private _serverData: ServerDataService,
  ) { }

  ngOnInit() {
    this._title.setTitle("BlattWerkzeug");
    this._serverData.newsListFrontpage.refresh();
  }
}
