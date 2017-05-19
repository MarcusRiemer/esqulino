import {Component}                             from '@angular/core'

import {ProjectService}                        from '../project.service'

/**
 * Shows available drag-operations for the table editor.
 */
@Component({
    templateUrl: 'templates/sidebar-controls.html',
    selector : "schema-editor-table-sidebar-controls"
})
export class TableEditorSidebarControlsComponent {
    public static get SIDEBAR_IDENTIFIER() { return "schema-table-editor-controls" };

    public constructor(private _projectService : ProjectService) {

    }
}
