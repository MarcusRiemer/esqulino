import {Widget, WidgetDescription} from './widget'
import {
    QueryTableDescription
} from '../page.description'

export {QueryTableDescription}

/**
 * Renders a table for a query.
 */
export class QueryTable extends Widget {
    
    private _queryRefName : string;

    /**
     * The columns that should be displayed
     */
    private _columns: string[];

    constructor(desc : QueryTableDescription) {
        super("query-table");
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
