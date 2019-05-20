import { Component, ViewChild, TemplateRef, OnInit } from "@angular/core";

import { ServerDataService, ToolbarService } from '../../shared';

/**
 * Shows All block languages that are known to the server.
 */
@Component({
  templateUrl: './templates/overview-block-language.html'
})

export class OverviewBlockLanguageComponent implements OnInit {
  @ViewChild('toolbarItems')
  toolbarItems: TemplateRef<any>;

  constructor(
    private _serverData: ServerDataService,
    private _toolbarService: ToolbarService,
  ) { }

  ngOnInit(): void {
    this._toolbarService.addItem(this.toolbarItems);
  }

  public get availableBlockLanguages() {
    return (this._serverData.listBlockLanguages);
  }

  public deleteBlockLanguage(id: string) {
    this._serverData.deleteBlockLanguage(id);
  }
}
