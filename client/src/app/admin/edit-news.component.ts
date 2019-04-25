import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
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
  ) {}

  private readonly _id = this._activeRoute.snapshot.paramMap.get('id');

  public newsData : AdminNewsDescription;
  public readonly queryParams = this._activeRoute.snapshot.queryParams;

  //interval = interval(5000).subscribe(test => {console.log(this.newsData)})

  public ngOnInit() {
    this._serverData.getAdminNewsSingle.getDescription(this._id).pipe(
      first()
    ).subscribe(news => this.newsData = news);
  }

  public updateData() {
    console.log(this.newsData);
    this._serverService.updateNews(this.newsData);
    this._router.navigate(['admin/news']);
  }
}