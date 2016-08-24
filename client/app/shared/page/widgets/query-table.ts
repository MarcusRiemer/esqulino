import {QuerySelect, ResultColumn}       from '../../../shared/query'

import {Page, QueryReference}            from '../page'
import {QueryTableDescription}           from '../page.description'
import {Widget, WidgetHost}              from '../hierarchy'

import {WidgetBase, WidgetDescription}   from './widget-base'

export {QueryTableDescription}

/**
 * Renders a table for a query.
 */
export class QueryTable extends WidgetBase {
    
    private _queryRefName : string;

    /**
     * The columns that should be displayed
     */
    private _columns: string[];

    constructor(desc : QueryTableDescription, parent? : WidgetHost) {
        super("query-table", "widget", parent);
        this._queryRefName = desc.queryRefName;
        this._columns = desc.columns;
    }

    /**
     * This describes a minimal query table
     */
    static get emptyDescription() : QueryTableDescription {
        return ({
            type : "query-table",
            columns : []
        })
    }

    /**
     * @return The variable name that references the table
     */
    get queryReferenceName() {
        return (this._queryRefName);
    }

    /**
     * @return True, if this query table references any columns
     */
    get hasColumnReferences() {
        return (this.columnNames.length > 0);
    }

    /**
     * @return A (hopefully) resolveable reference to a query.
     */
    get queryReference() : QueryReference {
        return (this.page.getQueryReferenceByName(this.queryReferenceName));
    }

    /**
     * @return True, if this reference can be resolved on the current page.
     */
    get hasValidReference() {
        return (this.page.usesQueryReferenceByName(this.queryReferenceName) &&
                this.queryReference.isResolveable &&
                this.queryReference.query instanceof QuerySelect);
    }

    set columnNames(value : string[]) {
        this._columns = value;
    }
    
    /**
     *
     */
    get columnNames() {
        return (this._columns);
    }

    /**
     * @return 
     */
    get columns() : ResultColumn[] {
        if (this.queryReferenceName) {            
            // 1) Get the reference itself
            const ref = this.queryReference
            // 2) Resolve the reference to the actual query
            const query = ref.query as QuerySelect;
            const possibleColumns = query.select.actualColums;
            // 3) Pick the columns that are wished by the user
            const columns = this.columnNames
                .map(name => possibleColumns.find(col => col.shortName == name))
                .filter(c => !!c)
            
            return (columns);
        } else {
            return [];
        }
    }

    /**
     * @return The columns that are actually available to render.
     */
    get availableColumns() : ResultColumn[] {
        if (this.queryReference &&
            this.queryReference.isResolveable &&
            this.queryReference.query instanceof QuerySelect) {

            const query = this.queryReference.query as QuerySelect;
            const columns = query.select.actualColums
            return (columns);
            
        } else {
            return ([]);
        }

    }

    /**
     * Updates the model to use all columns that are available.
     */
    useAllColumns() {
        if (this.hasValidReference) {
            // Compute all possible columns
            const ref = this.queryReference;
            const query = ref.query as QuerySelect;
            const possibleColumns = query.select.actualColums;

            this.columnNames = possibleColumns.map(c => c.shortName);
        }
    }

    /**
     * Sets a new referenced query, cleaning the current
     * columns as a side effect.
     */
    set queryReferenceName(name : string) {
        this._queryRefName = name;
        this._columns = [];
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : QueryTableDescription = {
            type : "query-table",
            queryRefName : this._queryRefName,
            columns : this._columns
        }

        return (toReturn);
    }
}
