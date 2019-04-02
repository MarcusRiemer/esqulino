import { Component, OnInit } from '@angular/core'
import { Title } from '@angular/platform-browser'

import { ServerDataService } from '../shared';

/**
 * Administrative Overview, this is the "greeting" page for every
 * user that enters the administration panels.
 */
@Component({
  templateUrl: 'templates/admin-overview.html'
})
export class AdminOverviewComponent implements OnInit {

  constructor(
    private _serverData: ServerDataService,
    private _title: Title,
  ) {
  }

  ngOnInit(): void {
    this._title.setTitle(`Admin - BlattWerkzeug`)
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

  public deleteGrammar(id: string) {
    this._serverData.deleteGrammar(id);
  }
}
