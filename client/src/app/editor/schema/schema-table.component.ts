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
        this.columnToHighlight = columnName;
        this.selectedColumnName.emit(columnName);
    }

    onColumnMouseOut() {
        this.columnToHighlight = undefined;
        this.selectedColumnName.emit(undefined);
    }

    /**
     * Should the details of every column in the table be shown 
     */
    showDetails: boolean = false;

    /**
     * Function to get the value if table with index index shows details
     * IN: index - the index of the table to get the details visibility value
     */
    getShowDetails() {
        return this.showDetails;
    }

    /**
     * Function to toggle the visibility of the table details
     * IN: index - the index of the table to toggle the details visibility
     */
    clickToggleDetails() {
        this.showDetails = !this.showDetails;
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
