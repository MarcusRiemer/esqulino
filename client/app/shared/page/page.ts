import {PageDescription}          from './page.description'
import {Row}                      from './widgets/row'
import {Renderer, LiquidRenderer} from './renderer/liquid'

export {PageDescription}

/**
 * The in-memory representation of a page.
 */
export class Page {
    private _id : string;
    private _name : string;
    private _rows : Row[];
    private _referencedQueries : string[]

    private _renderer : Renderer;
    
    constructor(desc : PageDescription) {
        this._id = desc.id;
        this._name = desc.name;

        this._renderer = new LiquidRenderer();

        this._rows = desc.rows.map(rowDesc => new Row(rowDesc));
        this._referencedQueries = desc.referencedQueries.splice(0);
    }

    /**
     * @return The name the user has given to this page
     */
    get name() {
        return (this._name);
    }

    /**
     * @return The automatically generated id for this page
     */
    get id() {
        return (this._id);
    }

    /**
     * @return A renderer that can be used to render this page
     */
    get renderer() {
        return (this._renderer);
    }

    /**
     * @return All rows of this page
     */
    get rows() {
        return (this._rows);
    }

    get referencedQueryIds() {
        return (this._referencedQueries);
    }

    /**
     * @param queryId The ID of the query in question.
     *
     * @return True, if this query is used by this page.
     */
    isUsingQuery(queryId : string) {
        return (this._referencedQueries.some(refId => queryId == refId));
    }

    toModel() : PageDescription {
        return ({
            id : this._id,
            name : this._name,
            rows : this._rows.map(r => r.toModel()),
            referencedQueries : this._referencedQueries
        });
    }
}
