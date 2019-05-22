import { Component } from '@angular/core';
import { ServerDataService } from '../../shared';

@Component({
  selector: 'grammar-overview-selector',
  templateUrl: './templates/overview-grammar.html'
})

export class OverviewGrammarComponent {
  constructor(
    private _serverData: ServerDataService
  ) { }

  public get availableGrammars() {
    return (this._serverData.listGrammars);
  }

  public deleteGrammar(id: string) {
    this._serverData.deleteGrammar(id);
  }
}
