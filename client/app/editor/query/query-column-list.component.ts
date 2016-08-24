import {Component, Input, OnInit}         from '@angular/core'

import {SyntaxTree, ResultColumn}         from '../../shared/query'

/**
 * Displays re-orderable columns of a specific query. This may be used for
 * widgets
 */
@Component({
    selector: 'query-column-list',
    templateUrl: 'app/editor/query/templates/query-column-list.html'
})
export class QueryColumnListComponent implements OnInit {
    /**
     * The SELECT that ultimately provides the columns.
     */
    @Input() select : SyntaxTree.Select;

    /**
     * The initial (and resulting) column order.
     */
    @Input() columnNames : string[] = [];

    ngOnInit() {

    }

    /**
     * @return The actual columns that should be displayed.
     */
    get columns() : ResultColumn[] {
        return (this.columnNames.map(c => this.select.getActualColumnByName(c)));
    }

    /**
     * The query the column list is part of.
     */
    get query() {
        return (this.select.query);
    }

    /**
     * @return True, if a "append new column here" marker should appear.
     */
    get showBlueprintDropDarget() {
        return (false);
    }
}
