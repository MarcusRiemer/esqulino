import { Component, Input } from "@angular/core";

import { ServerDataService } from '../shared';
import { locales } from '../shared/change-language.component';

@Component({
  templateUrl: './templates/news.html'
})
export class AdminNewsComponent {
  @Input() selectedLanguage: string;
  @Input() selectedEditor: string;
  
  constructor(
    private readonly _serverData: ServerDataService,
  ) {
    this.adminNewsList.value.subscribe(list => {
      console.log(list)
    })

  }

  readonly languages = locales;
  readonly editors = [
    {name: 'single',  description: 'Einfacher Bearbeitungsmodus'},
    {name: 'translation',  description: 'Übersetzungsmodus'},
  ]
  readonly adminNewsList = this._serverData.getAdminNewsList;
}