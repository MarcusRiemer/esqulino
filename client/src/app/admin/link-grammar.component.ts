import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { map } from 'rxjs/operators';

import { ServerDataService } from '../shared/server-data.service';
import { GrammarListDescription } from '../shared/syntaxtree/grammar.description';

/**
 * Creates a link to the grammar with the specified ID. Will attempt to
 * show a nice (human readable) name of the given grammar, but can also
 * gracefully fall back to the ID.
 */
@Component({
  templateUrl: 'templates/link-grammar.html',
  selector: 'link-grammar'
})
export class LinkGrammarComponent {
  /**
   * The ID of the grammar to display
   */
  @Input() grammarId: string;

  constructor(
    private _serverData: ServerDataService,
    private http: HttpClient
  ) {
  }

  /**
   * (Possibly) the description of the grammar
   */
  readonly description = this._serverData.availableGrammars.pipe(
    map(grammars => grammars.find(g => g.id == this.grammarId))
  );
}
