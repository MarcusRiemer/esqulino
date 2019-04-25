import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, LOCALE_ID, Inject } from '@angular/core';
import { first } from 'rxjs/operators';

import { AdminNewsDescription } from './../shared/syntaxtree/news.description';
import { ServerDataService } from '../shared';


@Component({
  templateUrl: './templates/edit-news.html'
})
export class AdminNewsEditing implements OnInit {
  constructor(
    private _serverData: ServerDataService,
    private _activeRoute: ActivatedRoute,
    private _router: Router,
    private _serverService: ServerDataService,
    @Inject(LOCALE_ID) private readonly localeID: string,
  ) {}

  private readonly _id = this._activeRoute.snapshot.paramMap.get('id');
  private readonly queryParams = this._activeRoute.snapshot.queryParams;

  public newsData : AdminNewsDescription;
  public readonly queryParamsLanguage = this.queryParams.language || this.localeID;
  public readonly queryParamsMode = this.queryParams.mode || 'single';

  //interval = interval(5000).subscribe(test => {console.log(this.newsData)})

  public ngOnInit(): void {
    this._serverData.getAdminNewsSingle.getDescription(this._id).pipe(
      first()
    ).subscribe(news => this.newsData = news);
  }

  public updateData(): void{
    console.log(this.newsData);
    this._serverService.updateNews(this.newsData);
    this._router.navigate(['admin/news']);
  }

  public deleteNews(): void {
    let question = confirm('Ganze Nachricht löschen ?')
    if (question) {
      this._serverService.deleteNews(this._id);
      this._router.navigate(['admin/news']);
    }
  }
}