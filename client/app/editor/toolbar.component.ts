import {Component}                      from '@angular/core';
import {ROUTER_DIRECTIVES}              from '@angular/router'

import {ToolbarService}                 from './toolbar.service';

@Component({
    templateUrl: 'app/editor/templates/toolbar.html',
    selector : 'editor-toolbar',
    directives : [ROUTER_DIRECTIVES]
})
export class ToolbarComponent {
    constructor (
        private _toolbarService: ToolbarService
    ) { }

    get toolbarService() {
        return (this._toolbarService);
    }
}
