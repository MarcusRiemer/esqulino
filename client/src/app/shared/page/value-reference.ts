import {
    encodeUriParameters, KeyValuePairs
} from '../../shared/util'


import {Project}                               from '../project'
import {Query, ResultColumn}                   from '../query'

import {
    ValueReferenceDescription, ColumnReferenceDescription,
    QueryReferenceDescription
} from './page.description'
import {Page}                                  from './page'

export {
    ValueReferenceDescription, ColumnReferenceDescription,
    QueryReferenceDescription
}

/**
 * A reference that can be made inside a page to some kind
 * of external resource.
 */
export abstract class ValueReference {
    // The page this reference occurs on
    private _page : Page;

    constructor(page : Page) {
        this._page = page;
    }

    protected get page() {
        return (this._page);
    }

    protected get project() {
        return (this.page.project);
    }
}

/**
 * Reference to a specific column of a query. Usually used
 * by components that allow the user to pick certain columns.
 *
 * If the referenced query does not guarantee a single value, 
 * this reference may only appear in a repeating environment.
 */
export class ColumnReference extends ValueReference {

    private _columnName : string;

    /**
     * The name of the query-variable that provides the column.
     */
    private _variableName : string;
    
    constructor(page : Page, desc : ColumnReferenceDescription) {
        super(page);
        this._columnName = desc.columnName;
        this._variableName = desc.variableName;
    }
}

/**
 * A reference to a query as a whole. These references may be
 */
export class QueryReference extends ValueReference {

    // The ID of the query this reference is pointing to
    private _queryId : string;

    // The "variable name" of this reference
    private _name : string;


    constructor(page : Page, desc : QueryReferenceDescription) {
        super(page);

        this._queryId = desc.queryId;
        this._name = desc.name;
    }

    /**
     * @return The "variable name" of this reference. If no explicit name is set, the
     *         name of the referenced query is used.
     */  
    get displayName() : string {
        if (this._name) {
            // Name is overridden
            return (this._name);
        } else {
            if (this._queryId) {
                const query = this.project.getQueryById(this._queryId);
                return (query.name);
            } else {
                return (undefined);
            }
        }
    }

    /**
     * This accessor shouldn't be used for data facing the enduser. Consider
     * using `displayName` instead.
     *
     * @return The "variable name" of this reference, if any explicit name ist set.
     */
    get name() {
        return (this._name);
    }

    /**
     * Be careful when changing reference names, this class does *nothing*
     * to keep track of renames at all.
     *
     * @param value The new "variable name" of this reference.
     */  
    set name(value : string) {
        this._name = value;
    }

    /**
     * This shouldn't be required very often, you probably want direct access
     * to the underlying query instead.
     * 
     * @return The ID of the query this reference is pointing to.
     */
    get queryId() : string {
        return (this._queryId);
    }

    /**
     * Careful: This will erase the current mapping.
     *
     * @param newId The id of the newly referenced query.
     */
    set queryId(newId : string) {
        this._queryId = newId;
        this.page.markSaveRequired();
    }

    /**
     * @return The query this reference is pointing to.
     */
    get query() {
        const query = this.project.getQueryById(this.queryId);
        if (!query) {
            throw new Error(`QueryReference ${this.name} (=> "${this.queryId}") could not be resolved`);
        }

        return (query);
    }

    /**
     * @return True, if this reference can be resolved.
     */
    get isResolveable() : boolean {
        return (this.isSet && this.project.hasQueryById(this.queryId));
    }

    /**
     * @return True, if the query was set manually any time.
     */
    get isSet() : boolean {
        return (!!(this.queryId));
    }

    /**
     * @return True, if the referenced query has output columns.
     */
    get hasColumns() : boolean {
        return (this.isResolveable && !!this.query.select);
    }

    /**
     * @return The columns that are exposed by this query.
     */
    get columns() {
        if (this.hasColumns) {
            const columns = this.query.select.actualColums;

            return (columns);
        } else {
            return ([]);
        }
    }

    /**
     * Resets the whole state of this reference, making it point
     * to no query at all.
     */
    clear() : void {
        this._queryId = undefined;
        this._name = undefined;
    }

    /**
     * @return Turns this reference into a storable representation
     */
    toModel() : QueryReferenceDescription {
        const toReturn : QueryReferenceDescription = {
            type : "query"
        }

        if (this._name) {
            toReturn.name = this._name;
        }

        if (this._queryId) {
            toReturn.queryId = this._queryId;
        }
        
        return (toReturn);
    }
    
}
