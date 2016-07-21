import {Project}                               from '../project'

import {
    ValueReferenceDescription, ColumnReferenceDescription
} from './page.description'
import {Page}                                  from './page'

/**
 * A reference that can be made inside a page to some kind
 * of external resource.
 */
export class ValueReference {
    // The page this reference occurs on
    private _page : Page;

    // The project this reference is part of
    private _project : Project;

    constructor(project : Project, page : Page) {
        this._project = project;
        this._page = page;
    }
}

/**
 * Reference to a specific column of a query. Usually used
 * by components that allow the user to pick certain columns.
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
