import {Query, ResultColumn}             from '../../../shared/query'

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
        super({ type: "query-table", category: "structural", isEmpty: false}, parent);
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
     * Sets a new referenced query, clearing the previously used
     * columns as a side effect.
     */
    set queryReferenceName(name : string) {
        this._queryRefName = name;
        this.useAllColumns();
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
    get hasValidReference() : boolean {
        return (this.page.usesQueryReferenceByName(this.queryReferenceName) &&
                this.queryReference.isResolveable &&
                !!this.queryReference.query.select);
    }

    set columnNames(value : string[]) {
        this._columns = value;
        this.fireModelChange();
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
            const possibleColumns = ref.query.select.actualColums;
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
            this.queryReference.query.select) {
            return (this.queryReference.query.select.actualColums);
            
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
            const possibleColumns = ref.query.select.actualColums;

            this.columnNames = possibleColumns.map(c => c.shortName);

            this.fireModelChange();
        }
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
