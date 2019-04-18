import { Component, Input, LOCALE_ID, Inject} from '@angular/core';

import { ServerDataService } from './serverdata/server-data.service';
import { locales } from './change-language.component'

@Component({
  selector: 'multilingual-editor',
  templateUrl: './templates/multilingual-editor.html'
})
export class MultiLingualEditorComponent {
  @Input() editingString: {[key: string]: string};
  @Input() control: string = this.control || 'input';
  @Input() language: string = this.language || this.localeId;

  constructor(
    @Inject(LOCALE_ID) readonly localeId: string,
    private _serverData: ServerDataService
  ) {}

  readonly languages = locales;
}