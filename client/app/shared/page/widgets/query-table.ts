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

    constructor(desc : QueryTableDescription) {
        super("query-table");
        this._queryRef = desc.queryRef;
    }

    get queryReference() {
        return (this._queryRef);
    }

    set queryReference(ref : ReferencedQuery) {
        this._queryRef = ref;
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : QueryTableDescription = {
            type : "query-table",
            queryRef : this._queryRef
        }

        return (toReturn);
    }
}
