import {Component, Input, Output, OnInit, OnDestroy, EventEmitter}        from '@angular/core';

import {Table}                                      from '../../shared/schema'

import {ProjectService, Project}                    from '../project.service'
import {ToolbarService}                             from '../toolbar.service'


/**
 * Displays the schema for a list of tables.
 */
@Component({
    templateUrl: 'templates/schema-table.html',
    selector: "sql-table"
})
export class SchemaTableComponent {

    /**
     * The tables to display.
     */
    @Input() table : Table;

    @Input() readOnly : boolean;

    @Input() columnToHighlight : any;

    @Output('columnToHighlightChange') selectedColumnName = new EventEmitter();


    onColumnMouseEnter(columnName : any) {
        if(!this.readOnly) {
            this.columnToHighlight = columnName;
            this.selectedColumnName.emit(columnName);
        }
    }

    onColumnMouseOut() {
        if(!this.readOnly) {
            this.columnToHighlight = undefined;
            this.selectedColumnName.emit(undefined);
        }
    }

    /**
     * True when table editing is enabled
     */
    editingEnabled : boolean = false;

    /**
     * Function to enable/disable table editing
     */
    toggleTableEditing() {
        this.editingEnabled = !this.editingEnabled;
    }

    /**
     * Getter editingEnabled
     */
    getEditingEnabled() {
        return this.editingEnabled;
    }
}
