import {
    encodeUriParameters, KeyValuePairs
} from '../../shared/util'


import {Project}                               from '../project'
import {QuerySelect, ResultColumn}             from '../query'

import {
    ValueReferenceDescription, ColumnReferenceDescription,
    QueryReferenceDescription
} from './page.description'
import {Page, ParameterMapping}                from './page'

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

    // How are these parameters fulfilled?
    private _mapping : ParameterMapping[] = [];

    constructor(page : Page, desc : QueryReferenceDescription) {
        super(page);

        this._queryId = desc.queryId;
        this._name = desc.name;

        // Can a previous mapping be loaded or is there need for a new mapping?
        if (desc.mapping && desc.mapping.length > 0) {
            // There is a specific mapping already provided, use that
            this._mapping = desc.mapping.map(m => new ParameterMapping(page, m));
        } else if (this.isResolveable) {
            // There are no mappings yet, but there is a query that possibly
            // needs matching
            this.createDefaultMapping();
        } else {
            // There is nothing to map.
            this._mapping = [];
        }
    }

    /**
     * Discards the current mapping and builds a new one based on the current page
     * and the currently required parameters.
     */
    protected createDefaultMapping() {
        this._mapping = this.query.parameters.map(qp => new ParameterMapping(this.page, {
            parameterName : qp.key
        }));
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
        this.createDefaultMapping();
    }

    /**
     * @return How the input parameters of this query should be mapped
     */
    get mapping() {
        return (this._mapping);
    }

    get keyValueMapping() : KeyValuePairs {
        let toReturn : KeyValuePairs = {};
        this._mapping.forEach(v => toReturn[v.parameterName] = v.providingName);
        return (toReturn);
    }

    /**
     * @param newMapping How the input parameters of this query should be mapped
     */
    set mapping(newMapping : ParameterMapping[]) {
        this._mapping = newMapping;
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
    get isResolveable() {
        return (!!(this.queryId && !!this.project.hasQueryById(this.queryId)));
    }

    /**
     * @return True, if the referenced query has output columns.
     */
    get hasColumns() {
        return (!!(this.isResolveable && this.query instanceof QuerySelect));
    }

    /**
     * @return The columns that are exposed by this query.
     */
    get columns() {
        if (this.hasColumns) {
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
        const toReturn : QueryReferenceDescription = {
            type : "query"
        }

        if (this._name) {
            toReturn.name = this._name;
        }

        if (this._queryId) {
            toReturn.queryId = this._queryId;
        }

        if (this._mapping && this._mapping.length > 0) {
            toReturn.mapping = this._mapping.map(m => m.toModel());
        }
        
        return (toReturn);
    }
    
}
