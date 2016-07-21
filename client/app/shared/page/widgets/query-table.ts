import {Widget, WidgetDescription} from './widget'
import {
    QueryTableDescription, ReferencedQuery
} from '../page.description'

export {QueryTableDescription}

/**
 * Renders a table for a query.
 */
export class QueryTable extends Widget {
    private _queryRef : ReferencedQuery;

    /**
     * The columns that should be displayed
     */
    private _columns: string[];

    constructor(desc : QueryTableDescription) {
        super("query-table");
        this._queryRef = desc.queryRef;
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

    get queryReference() {
        return (this._queryRef);
    }

    /**
     * Sets a new referenced query, cleaning the current
     * columns as a side effect.
     */
    set queryReference(ref : ReferencedQuery) {
        this._queryRef = ref;
        this._columns = [];
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : QueryTableDescription = {
            type : "query-table",
            queryRef : this._queryRef,
            columns : []
        }

        return (toReturn);
    }
}
