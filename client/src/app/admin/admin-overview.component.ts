import { Component, OnInit } from '@angular/core'

import { ServerDataService } from '../shared/server-data.service';

/**
 * Administrative Overview, this is the "greeting" page for every
 * user that enters the administration panels.
 */
@Component({
  templateUrl: 'templates/admin-overview.html'
})
export class AdminOverviewComponent {
  constructor(private _serverData: ServerDataService) {
  }

  public get availableBlockLanguages() {
    return (this._serverData.listBlockLanguages);
  }

  public get availableGrammars() {
    return (this._serverData.listGrammars);
  }

  public deleteBlockLanguage(id: string) {
    this._serverData.deleteBlockLanguage(id);
  }
}
