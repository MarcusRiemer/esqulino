import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';

import { ServerDataService } from './serverdata/server-data.service';

@Component({
  templateUrl: './templates/multilangual-editor.html'
})
export class MultiLangualEditorComponent {
  constructor(
    private _activeRoute: ActivatedRoute,
    private _serverData: ServerDataService  
  ) {
    this._activeRoute.queryParams.subscribe(params => {
      console.log(params);
    })
  }

  readonly testString = this._activeRoute.queryParams;
}

