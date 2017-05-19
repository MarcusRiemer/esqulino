import {Component}                             from '@angular/core'

import {SchemaService}                         from '../schema.service'

@Component({
    templateUrl: 'templates/sidebar.html',
    selector : "schema-editor-table-sidebar"
})
export class SchemaTableEditorSidebarComponent {
    public static get SIDEBAR_IDENTIFIER() { return "schema-table-editor" };

    public constructor(private _schemaService : SchemaService) {

    }

    public get commandsHolder() {
        return (this._schemaService.getCurrentlyEditedStack());
    }
}
