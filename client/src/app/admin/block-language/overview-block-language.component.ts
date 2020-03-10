import { Component, ViewChild, TemplateRef, OnInit } from "@angular/core";

import { ToolbarService } from '../../shared';
import { ListBlockLanguageDataService, MutateBlockLanguageService } from '../../shared/serverdata';

/**
 * Shows All block languages that are known to the server.
 */
@Component({
  templateUrl: './templates/overview-block-language.html'
})

export class OverviewBlockLanguageComponent implements OnInit {
  @ViewChild('toolbarItems', { static: true })
  toolbarItems: TemplateRef<any>;

  constructor(
    private _list: ListBlockLanguageDataService,
    private _mutate: MutateBlockLanguageService,
    private _toolbarService: ToolbarService,
  ) { }

  ngOnInit(): void {
    this._toolbarService.addItem(this.toolbarItems);
  }

  readonly availableBlockLanguages = this._list.listCache;

  public deleteBlockLanguage(id: string) {
    this._mutate.deleteSingle(id);
  }
}
