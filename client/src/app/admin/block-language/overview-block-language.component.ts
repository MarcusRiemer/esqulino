import { ServerDataService } from '../../shared';
import { Component } from "@angular/core";


@Component({
  selector: 'block-language-overview-selector',
  templateUrl: './templates/overview-block-language.html'
})

export class OverviewBlockLanguageComponent {
  constructor(
    private _serverData: ServerDataService
  ) {}

  public get availableBlockLanguages() {
    return (this._serverData.listBlockLanguages);
  }

  public deleteBlockLanguage(id: string) {
    this._serverData.deleteBlockLanguage(id);
  }
}
