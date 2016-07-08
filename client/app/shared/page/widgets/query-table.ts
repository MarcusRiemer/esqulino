import {Widget, WidgetDescription} from './widget'
import {QueryTableDescription}     from '../page.description'

export {QueryTableDescription}

/**
 * Renders a table for a query.
 */
export class QueryTable extends Widget {
    private _queryId : string;

    constructor(desc : QueryTableDescription) {
        super("query-table");
        this._queryId = desc.queryId;
    }

    get queryId() {
        return (this._queryId);
    }

    protected toModelImpl() : WidgetDescription {
        const toReturn : QueryTableDescription = {
            type : "query-table",
            queryId : this._queryId
        }

        return (toReturn);
    }
}
