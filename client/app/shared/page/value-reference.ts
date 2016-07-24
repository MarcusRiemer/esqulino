import {Project}                               from '../project'
import {QuerySelect, ResultColumn}  from '../query'

import {
    ValueReferenceDescription, ColumnReferenceDescription,
    QueryReferenceDescription
} from './page.description'
import {Page}                                  from './page'


/**
 * A reference that can be made inside a page to some kind
 * of external resource.
 */
export abstract class ValueReference {
    // The page this reference occurs on
    private _page : Page;

    // The project this reference is part of
    private _project : Project;

    constructor(project : Project, page : Page) {
        this._project = project;
        this._page = page;
    }

    protected get page() {
        return (this._page);
    }

    protected get project() {
        return (this._project);
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

    private _variableName : string;
    
    constructor(project : Project, page : Page, desc : ColumnReferenceDescription) {
        super(project, page);
        this._columnName = desc.columnName;
        this._variableName = desc.variableName;
    }
}

/**
 * A reference to a query as a whole.
 */
export class QueryReference extends ValueReference {

    // The ID of the query this reference is pointing to
    private _queryId : string;

    // The "variable name" of this reference
    private _name : string;

    constructor(project : Project, page : Page, desc : QueryReferenceDescription) {
        super(project, page);

        this._queryId = desc.queryId;
        this._name = desc.name;
    }

    /**
     * @return The "variable name" of this reference
     */  
    get name() : string {
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
     * @return The query this reference is pointing to.
     */
    get query() {
        const query = this.project.getQueryById(this.queryId);
        if (!query) {
            throw new Error(`QueryReference "${this.queryId}" could not be resolved`);
        }

        return (query);
    }

    /**
     * @return True, if this reference can be resolved.
     */
    get isResolveable() {
        return (!!this.project.hasQueryById(this.queryId));
    }

    /**
     * @return The columns that are exposed by this query.
     */
    get columns() {
        if (this.isResolveable) {
            const selectQuery = this.query as QuerySelect;
            const columns = selectQuery.select.actualColums;

            return (columns);
        } else {
            return ([]);
        }
    }

    /**
     * @return Turns this reference into a storable representation
     */
    toModel() : QueryReferenceDescription {
        return ({
            type : "query",
            name : this._name,
            queryId : this._queryId
        })
    }
    
}
