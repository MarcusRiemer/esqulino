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

  ngOnInit() {
    this.availableBlockLanguages.subscribe(r => console.log("New cached foos"));
  }

  public get availableBlockLanguages() {
    return (this._serverData.availableBlockLanguages);
  }

  public get availableGrammars() {
    return (this._serverData.availableGrammars);
  }

  public refreshBlockLanguages() {
    this._serverData.refreshBlockLanguages();
  }

  public deleteBlockLanguage(id: string) {
    this._serverData.deleteBlockLanguage(id);
  }
}
