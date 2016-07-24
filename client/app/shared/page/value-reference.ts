import {Project}                               from '../project'

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
    private _queryId : string;

    private _name : string;

    constructor(project : Project, page : Page, desc : QueryReferenceDescription) {
        super(project, page);

        this._queryId = desc.queryId;
        this._name = desc.name;
    }

    get name() : string {
        return (this._name);
    }

    set name(value : string) {
        this._name = value;
    }

    get queryId() : string {
        return (this._queryId);
    }

    get query() {
        return (this.project.getQueryById(this.queryId));
    }

    toModel() : QueryReferenceDescription {
        return ({
            type : "query",
            name : this._name,
            queryId : this._queryId
        })
    }
    
}
