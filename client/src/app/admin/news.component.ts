import { filter, map } from 'rxjs/operators';
import { Component, Input, Inject, LOCALE_ID, OnChanges, SimpleChanges } from "@angular/core";

import { ServerDataService } from '../shared';
import { locales } from '../shared/change-language.component';

@Component({
  templateUrl: './templates/news.html'
})
export class AdminNewsComponent {
  @Input() selectedLanguage: string = this.localeId;
  @Input() selectedEditor: string = 'single';
  @Input() searchFor: string = '';
  
  constructor(
    @Inject(LOCALE_ID) readonly localeId: string,
    private readonly _serverData: ServerDataService
  ) { }

  readonly languages = locales;
  readonly editors = [
    {name: 'single',  description: 'Einfacher Bearbeitungsmodus'},
    {name: 'translation',  description: 'Übersetzungsmodus'},
  ]

  public adminNewsList = this._serverData.getAdminNewsList.value;
  public searchList = this.adminNewsList;

  public change(): void {
    this.searchList = this.adminNewsList;
    this.searchFor = this.searchFor.toLowerCase();
    this.searchList = this.searchList.pipe(
      map(item => item.filter(entry =>
          entry.id.includes(this.searchFor)
        || (entry.text ? (entry.text[this.selectedLanguage] ? entry.text[this.selectedLanguage].toLowerCase().includes(this.searchFor) : null) : null)
        || (entry.title ? (entry.title[this.selectedLanguage] ? entry.title[this.selectedLanguage].toLowerCase().includes(this.searchFor) : null) : null)
        || (entry.published_from ? entry.published_from : null)
      ))
    )
  }

  public createNews(): void {
    
  }
}