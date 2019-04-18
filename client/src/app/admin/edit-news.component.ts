import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { ServerDataService } from '../shared';

@Component({
  templateUrl: './templates/edit-news.html'
})
export class AdminNewsEditing {
  constructor(
    private _serverData: ServerDataService,
    private _activeRoute: ActivatedRoute
  ) {
  }

  private readonly _id = this._activeRoute.snapshot.paramMap.get('id');

  readonly queryParams = this._activeRoute.snapshot.queryParams;
  readonly editingNews = this._serverData.getAdminNewsSingle.getDescription(this._id);

}