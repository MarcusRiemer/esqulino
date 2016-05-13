import {Component, Input}               from '@angular/core';

import {TableDescription}               from '../shared/schema.description'

@Component({
    templateUrl: 'app/editor/templates/schema.table.html',
    selector: "sql-table"
})
export class SchemaTableComponent {
    @Input() tables : TableDescription[];

    @Input() allowCreate : boolean = false;
}
