import { Component, OnInit } from '@angular/core'

import { ServerDataService } from 'app/shared/server-data.service';

@Component({
  templateUrl: 'templates/admin.html'
})
export class AdminComponent {
  constructor(private _serverData: ServerDataService) {
  }

  public get availableBlockLanguages() {
    return (this._serverData.availableBlockLanguages);
  }

  public get availableGrammars() {
    return (this._serverData.availableGrammars);
  }
}