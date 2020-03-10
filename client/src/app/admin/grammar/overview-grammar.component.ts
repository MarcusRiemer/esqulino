import { Component } from '@angular/core';
import { ListGrammarDataService, MutateGrammarService } from '../../shared/serverdata';

@Component({
  selector: 'grammar-overview-selector',
  templateUrl: './templates/overview-grammar.html'
})

export class OverviewGrammarComponent {
  constructor(
    private _list: ListGrammarDataService,
    private _mutate: MutateGrammarService,
  ) { }

  readonly availableGrammars = this._list.listCache;

  public deleteGrammar(id: string) {
    this._mutate.deleteSingle(id);
  }
}
