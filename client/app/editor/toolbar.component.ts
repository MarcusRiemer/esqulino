import {Component}                      from '@angular/core';

import {ToolbarService}                 from './toolbar.service';

@Component({
    templateUrl: 'app/editor/templates/toolbar.html',
    selector : 'editor-toolbar'
})
export class ToolbarComponent {
    constructor (
        private _toolbarService: ToolbarService
    ) { }

    get toolbarService() {
        return (this._toolbarService);
    }
}
