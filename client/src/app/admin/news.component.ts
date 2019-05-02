import { map } from 'rxjs/operators';
import { Component, Input, Inject, LOCALE_ID } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';

import { ServerDataService } from '../shared';
import { locales } from '../shared/change-language.component';
@Component({
  templateUrl: './templates/news.html'
})
export class AdminNewsListComponent {  
  constructor(
    @Inject(LOCALE_ID) readonly localeId: string,
    private readonly _serverData: ServerDataService,
    private _router: Router,
    private _active: ActivatedRoute
  ) { }

  readonly languages = locales;
  readonly editors = [
    {name: 'single',  description: 'Einfacher Bearbeitungsmodus'},
    {name: 'translation',  description: 'Übersetzungsmodus'},
  ]

  public adminNewsList = this._serverData.getAdminNewsList.value;
  public searchList = this.adminNewsList;
  public selectedLanguage: string = this.localeId;
  public selectedEditor: string = 'single';
  public searchFor: string = '';

  public change(): void {
    this.searchList = this.adminNewsList;
    this.searchFor = this.searchFor.toLowerCase();
    this.searchList = this.searchList.pipe(
      map(item => item.filter(entry =>
          entry.id.includes(this.searchFor)
        || (entry.text ? (entry.text[this.selectedLanguage] ? entry.text[this.selectedLanguage].toLowerCase().includes(this.searchFor) : null) : null)
        || (entry.title ? (entry.title[this.selectedLanguage] ? entry.title[this.selectedLanguage].toLowerCase().includes(this.searchFor) : null) : null)
        || (entry.publishedFrom ? entry.publishedFrom : null)
      ))
    )
  }

  public createNews(): void {
    this._router.navigate(['create'], { relativeTo: this._active })
  }
}