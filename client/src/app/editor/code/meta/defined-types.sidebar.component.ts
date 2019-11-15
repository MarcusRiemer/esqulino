import { Component } from '@angular/core';

import { DragService } from '../../drag.service';
import { CurrentCodeResourceService } from '../../current-coderesource.service';

@Component({
  templateUrl: 'templates/defined-types-sidebar.html',
})
export class DefinedTypesSidebarComponent {
  constructor(
    private _dragService: DragService,
    private _current: CurrentCodeResourceService
  ) {
  }
}