import { Component, Input, Inject, LOCALE_ID } from "@angular/core";

import { ServerDataService } from '../shared';
import { locales } from '../shared/change-language.component';

@Component({
  templateUrl: './templates/news.html'
})
export class AdminNewsComponent {
  @Input() selectedLanguage: string = this.localeId;
  @Input() selectedEditor: string = 'single';
  
  constructor(
    @Inject(LOCALE_ID) readonly localeId: string,
    private readonly _serverData: ServerDataService
  ) { }

  readonly languages = locales;
  readonly editors = [
    {name: 'single',  description: 'Einfacher Bearbeitungsmodus'},
    {name: 'translation',  description: 'Übersetzungsmodus'},
  ]
  readonly adminNewsList = this._serverData.getAdminNewsList;
}