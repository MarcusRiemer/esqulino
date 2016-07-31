import {Project}                              from '../project'
import {ProjectResource}                      from '../resource'
import {Query}                                from '../query'

import {
    PageDescription, PageParameterDescription,
    ParameterMappingDescription,
    QueryReferenceDescription, WidgetDescription,
    ValueReferenceDescription, ColumnReferenceDescription,
    ColumnDescription, RowDescription,
    CURRENT_API_VERSION
} from './page.description'
import {Row}                                  from './widgets/row'
import {Renderer, LiquidRenderer}             from './renderer/liquid'
import {
    Widget, ParametrizedWidget, UserInputWidget
} from './widgets/widget'
import {
    ValueReference, ColumnReference, QueryReference
} from './value-reference'

export {
    PageDescription, ColumnDescription, RowDescription,
    Row, WidgetDescription,
    ValueReferenceDescription, ColumnReferenceDescription,
    QueryReferenceDescription,
    ValueReference, ColumnReference, QueryReference,
    ParameterMappingDescription,
    CURRENT_API_VERSION
}

/**
 * The in-memory representation of a page.
 */
export class Page extends ProjectResource {
    private _rows : Row[] = [];
    private _referencedQueries : QueryReference[] = [];
    private _parameters : PageParameter[] = [];
    private _renderer : Renderer;
    
    constructor(desc : PageDescription, project? : Project) {
        super(project, desc);

        // We only render stuff via liquid for the moment
        this._renderer = new LiquidRenderer();

        // Map descriptions of widgets to actual representations
        if (desc.rows) {
            this._rows = desc.rows.map(rowDesc => new Row(rowDesc, this));
        }

        // Resolve referenced queries
        if (desc.referencedQueries) {
            this._referencedQueries = desc.referencedQueries.map(refDesc => new QueryReference(project, this, refDesc));
        }

        // Obtain parameters
        if (desc.parameters) {
            this._parameters = desc.parameters.map(p => new PageParameter(this, p));
        }
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

    /**
     * Adds a new row with a default column that spans over the whole row.
     * 
     * @index The index to insert the row at, 0 is the very beginning
     */
    addEmptyRow(index : number) {
        this.addRow(index, Row.emptyDescription);
    }

    /**
     * Adds a new row according to the given specification.
     * 
     * @index The index to insert the row at, 0 is the very beginning
     */
    addRow(index : number, newRowDesc : RowDescription) {
        const newRow = new Row(newRowDesc, this);
        this._rows.splice(index, 0, newRow);
    }

    /**
     * Removes the given row.
     */
    removeRow(row : Row) {
        const index = this._rows.indexOf(row);
        if (index >= 0) {
            this.removeRowByIndex(index);
        } else {
            throw new Error(`Attempted to remove unknown row: ${JSON.stringify(row.toModel())}`);
        }
    }

    /**
     * Removes the given row.
     */
    removeRowByIndex(rowIndex : number) {
        if (rowIndex >= 0 && rowIndex < this._rows.length) {
            this._rows.splice(rowIndex, 1);
        } else {
            throw new Error(`Attempted to remove invalid row index ${rowIndex}`);
        }
    }

    /**
     * Adds a new widget to this page.
     *
     * @param widget The widget to add
     * @param rowIndex The row this widget should be added
     * @param columnIndex The column this widget should be added
     * @param widgetIndex The position of the widget inside the column
     */
    addWidget(widget : WidgetDescription,
              rowIndex : number, columnIndex : number,
              widgetIndex : number) {
        // Ensure row index
        if (rowIndex >= this._rows.length) {
            throw new Error(`Adding widget ("${JSON.stringify(widget)}") exceeds row count (given: ${rowIndex}, length ${this._rows.length}`);
        }

        // Ensure column index
        const row = this._rows[rowIndex];
        if (columnIndex >= row.columns.length) {
            throw new Error(`Adding widget ("${JSON.stringify(widget)}") exceeds column index at row ${rowIndex} (given: ${columnIndex}, length ${row.columns.length}`);
        }

        // Attempt to add the widget
        const column = row.columns[columnIndex];
        column.addWidget(widget, widgetIndex);

        this.markDirty();
    }

    /**
     * Remove a widgets with a position that is exactly known.
     */
    removeWidgetByIndex(rowIndex : number, columnIndex : number, widgetIndex : number) {
        // Ensure row index
        if (rowIndex >= this._rows.length) {
            throw new Error(`Removing widget exceeds row count (given: ${rowIndex}, length ${this._rows.length}`);
        }

        // Ensure column index
        const row = this._rows[rowIndex];
        if (columnIndex >= row.columns.length) {
            throw new Error(`Removing widget exceeds column index at row ${rowIndex} (given: ${columnIndex}, length ${row.columns.length}`);
        }

        const column = row.columns[columnIndex];
        column.removeWidgetByIndex(widgetIndex);

        this.markDirty();
    }

    /**
     * Removes a specific widget.
     */
    removeWidget(widgetRef : any) {
        // As we have no information about the position, we need to check
        // every row ...
        const deleted = this._rows.some(r => {
            // ... and every column ...
            const toReturn = r.columns.some(c => {
                // ... for the correct index to remove
                const index = c.widgets.findIndex(w => w == widgetRef);
                if (index >= 0) {
                    c.removeWidgetByIndex(index);
                    this.markDirty();
                    return (true);
                } else {
                    return (false);
                }
            });

            return (toReturn);
        });

        if (!deleted) {
            throw new Error(`Could not remove widget ("${JSON.stringify(widgetRef.toModel())}"): Not found in any cell`);
        }
    }

    /**
     * Adds a new query reference to this page.
     *
     * @param ref The query reference to add.
     */
    addQueryReference(ref : QueryReferenceDescription) {
        // Ensure this reference name isn't in use already
        if (this.usesQueryReferenceByName(ref.name)) {
            throw new Error(`Name "${ref.name}" is already in use`);
        }

        this._referencedQueries.push(new QueryReference(this.project, this, ref));
        this.markDirty();
    }

    /**
     * Remove an exact reference to a query. This does not take
     * the name or the query id into account, it uses object equality
     * so you need to obtain a matching reference first.
     *
     * @param ref The query reference to remove.
     */
    removeQueryReference(ref : QueryReference) {
        const index = this._referencedQueries.indexOf(ref);

        if (index >= 0) {
            this._referencedQueries.splice(index, 1);
        } else {
            throw new Error(`Could not remove reference "${ref.name}"`);
        }
    }

    /**
     * Adds a new parameter to this page.
     */
    addParameter(desc : PageParameterDescription) {
        this._parameters.push(new PageParameter(this, desc));
    }


    /**
     * Removes an existing parameter from this page.
     */
    removeParameter(param : PageParameter) {
        const index = this._parameters.findIndex(existing => param == existing);
        if (index >= 0) {
            this._parameters.splice(index, 1);
        } else {
            throw new Error(`Attempted to remove unknown parameter ${param.name}`);
        }
    }

    /**
     * @return All parameters this page requires to operate.
     */
    get requestParameters() : PageParameter[] {
        return (this._parameters);
    }

    /**
     * @return All parameter names that need to be given.
     */
    get requiredParameterNames() : string[] {
        const queryParams = this._referencedQueries
            .filter(r => r.isResolveable)
            .map(r => r.query.parameters.map(p => p.key));

        return ([].concat(...queryParams));
    }

    /**
     * @return True, if the given name is already in use for a query.
     */
    usesQueryReferenceByName(name : string) {
        return (this._referencedQueries && this._referencedQueries.some(q => q.name == name));
    }

    /**
     * @param queryId The ID of the query in question.
     *
     * @return True, if this query is used by this page.
     */
    usesQueryById(queryId : string) {
        return (this._referencedQueries.some(ref => queryId == ref.queryId));
    }

    /**
     * @return The referenced query with the given name.
     */
    getQueryReferenceByName(name : string) {
        return (this._referencedQueries.find(q => q.name == name));
    }

    /**
     * @return Ids of all queries that are referenced by this page.
     */
    get referencedQueryIds() : string[] {
        return (this._referencedQueries.map(q => q.queryId));
    }

    /**
     * @return All referenced queries alongside their name
     */
    get referencedQueries() : QueryReference[] {
        return (this._referencedQueries);
    }

    /**
     * @return All widgets that are in use on this page.
     */
    get allWidgets() : Widget[] {
        const subs = this._rows.map(c => c.widgets);
        return ([].concat(...subs));
    }

    /**
     * @return All widgets that are in use on this page and require parameters to operate.
     */
    get parametrizedWidgets() : ParametrizedWidget[] {
        return (this.allWidgets.filter(w => w instanceof ParametrizedWidget) as ParametrizedWidget[]);
    }

    /**
     * @return All widgets that are in use on this page and provide input for parameters.
     */
    get userInputWidgets() : UserInputWidget[] {
        return (this.allWidgets.filter(w => w instanceof UserInputWidget) as UserInputWidget[]);
    }

    /**
     * @return True, if the following input could be provided
     */
    hasParameterProvider(name : string) {
        return (this._parameters.some(p => p.fullName == name) ||
                this.userInputWidgets.some(p => p.providesParameter(name))
        );
    }

    toModel() : PageDescription {
        // Some attributes are unconditional
        const toReturn : PageDescription = {
            id : this.id,
            name : this.name,
            apiVersion : this.apiVersion
        };

        if (this._referencedQueries.length > 0) {
            toReturn.referencedQueries = this._referencedQueries.map(r => r.toModel());
        }

        if (this._rows.length > 0) {
            toReturn.rows = this._rows.map(r => r.toModel());
        }

        if (this._parameters.length > 0) {
            toReturn.parameters = this._parameters.map(p => p.toModel());
        }
        
        return (toReturn);
    }
}

/**
 * This class bridges the fact that the page uses a namespaced data model
 * while the queries do not. This class maps variables with prefixes like 
 * "input" or "get" (these are used on the page) to the unprefixed queries.
 *
 * As everything that is named a "parameter" does also act as a "value provider"
 * for its receiving site the nomenclature is a bit difficult to come by.
 */
export class ParameterMapping {
    private _paramName : string;

    private _providingName : string;

    private _page : Page;

    constructor(page : Page, desc : ParameterMappingDescription) {
        this._page = page;
        
        this._paramName = desc.parameterName;
        this._providingName = desc.providingName;
    }

    /**
     * @return True, if this mapping is fulfilled by the page it is assigned to.
     */
    get isSatisfied() : boolean {
        return (this._paramName && this._page.hasParameterProvider(this._providingName));
    }

    /**
     * @return The name of the thing that provides the value to the required value.
     */
    get providingName() {
        return (this._providingName);
    }

    /**
     * @param value The name of the thing that provides the value to the required value.
     */
    set providingName(value : string) {
        if (value.indexOf('.') < 0) {
            throw new Error(`Attempted to set provider name without domain: ${value}`);
        }
        
        this._providingName = value;
    }

    /**
     * @return The name of the wired parameter
     */
    get parameterName() {
        return (this._paramName);
    }

    /**
     * @param value The name of the wired parameter
     */
    set parameterName(value : string) {
        this._paramName = value;
    }

    /**
     * A not so nice leaky abstraction: The UI wants to display an icon for the
     * providing side of the mapping in various places.
     *
     * @return A font-awesome iconclass for the 
     */
    get providingIconClass() {
        if (!this.providingName || this.providingName.length == 0) {
            // There is no provider set
            return ("fa-sign-in");
        } else if (!this.isSatisfied) {
            // A provider is set, but it doesn't actually provide anything
            return ("fa-warning");
        } else if (this.providingName.startsWith("input.")) {
            // Provider is an input element
            return ("fa-keyboard-o");
        } else if (this.providingName.startsWith("get.")) {
            // Provider is a request parameter
            return ("fa-link");
        } else {
            // Neutral icon: Provider still needed
            return ("fa-sign-in");
        }
    }

    toModel() : ParameterMappingDescription {
        return ({
            parameterName : this._paramName,
            providingName : this._providingName
        });
    }
}

/**
 * A parameter that is required to render a page
 */
export class PageParameter {
    // The name of the parameter
    private _name : string;

    // The page this parameter is required on
    private _page : Page;
    
    constructor(page : Page, desc : PageParameterDescription) {
        this._name = desc.name;
    }

    /**
     * @return The name of the parameter this instance provides
     */
    get name() {
        return (this._name);
    }

    /**
     * @return The fully qualified name of this page parameter.
     */
    get fullName() {
        return (`get.${this.name}`);
    }

    /**
     * @param value The name of the parameter this instance provides
     */
    set name(value : string) {
        this._name = value;
    }

    toModel() : PageParameterDescription {
        return ({
            name : this._name
        });
    }
}
