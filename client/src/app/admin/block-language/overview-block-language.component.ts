import { Component, ViewChild, TemplateRef, OnInit } from "@angular/core";

import { ToolbarService } from '../../shared';
import { BlockLanguageDataService } from '../../shared/serverdata';

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
    private _serverData: BlockLanguageDataService,
    private _toolbarService: ToolbarService,
  ) { }

  ngOnInit(): void {
    this._toolbarService.addItem(this.toolbarItems);
  }

  public get availableBlockLanguages() {
    return (this._serverData.listCache);
  }

  public deleteBlockLanguage(id: string) {
    this._serverData.deleteBlockLanguage(id);
  }
}
