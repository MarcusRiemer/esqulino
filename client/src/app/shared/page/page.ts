import {Project}                              from '../project'
import {ProjectResource}                      from '../resource'
import {Query}                                from '../query'

import {
    PageDescription, PageParameterDescription,
    QueryReferenceDescription, WidgetDescription,
    ValueReferenceDescription, ColumnReferenceDescription,
    ColumnDescription, RowDescription,
    CURRENT_API_VERSION
} from './page.description'
import {
    Widget, WidgetHost, isWidgetHost, isWidget
} from './hierarchy'
import {
    ValueReference, ColumnReference, QueryReference
} from './value-reference'

import {Row}                                  from './widgets/row'
import {Body, BodyDescription}                from './widgets/body'
import {Renderer, LiquidRenderer}             from './renderer/liquid'
import {
    WidgetBase, ParametrizedWidget, UserInputWidget
} from './widgets/widget-base'
import {loadWidget}                           from './widgets/widget-loader'

export {
    PageDescription, ColumnDescription, RowDescription,
    Row, WidgetDescription,
    ValueReferenceDescription, ColumnReferenceDescription,
    QueryReferenceDescription,
    ValueReference, ColumnReference, QueryReference,
    CURRENT_API_VERSION
}

/**
 * The in-memory representation of a page.
 */
export class Page extends ProjectResource {
    private _body : Body;
    private _referencedQueries : QueryReference[] = [];
    private _parameters : PageParameter[] = [];
    private _renderer : Renderer;
    
    constructor(desc : PageDescription, project? : Project) {
        super(project, desc);

        // We only render stuff via liquid for the moment
        this._renderer = new LiquidRenderer();

        // Map descriptions of widgets to actual representations
        if (desc.body) {
            this._body = new Body(desc.body, this);
        } else {
            this._body = new Body(Body.emptyDescription, this);
        }

        // Listen to changes
        this._body.modelChanged.subscribe(_ => this.markSaveRequired());

        // Resolve referenced queries
        if (desc.referencedQueries) {
            this._referencedQueries = desc.referencedQueries.map(refDesc => new QueryReference(this, refDesc));
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
     * @return The representation HTML <body>
     */
    get body() {
        return (this._body);
    }

    /**
     * Adds a new row with a default column that spans over the whole row.
     *
     * TODO: This assumes there are only rows, nothing else.
     * 
     * @index The index to insert the row at, 0 is the very beginning
     */
    addEmptyRow(index : number) {
        this.addRow(index, Row.emptyDescription);
    }

    /**
     * Adds a new row according to the given specification.
     *
     * TODO: This assumes there are only rows, nothing else.
     * 
     * @index The index to insert the row at, 0 is the very beginning
     */
    addRow(index : number, newRowDesc : RowDescription) {
        const newRow = new Row(newRowDesc, this.body);
        this.body.children.splice(index, 0, newRow);
        this.markSaveRequired();
    }

    /**
     * Retrieves a row by the child index on this page. This method ensures
     * the thing returned is actually a row.
     *
     * TODO: This assumes there are only rows, nothing else.
     */
    getRow(rowIndex : number) : Row {
        // Ensure valid row index
        if (rowIndex >= this.body.children.length) {
            throw new Error(`Retrieving row exceeds row count (given: ${rowIndex}, length ${this.body.children.length}`);
        }

        // Ensure it is a row
        if (!(this.body.children[rowIndex] instanceof Row)) {
            throw new Error(`Parent widget #${rowIndex} is not a row, but a ${this.body.children[rowIndex].type}`);
        }

        return (this.body.children[rowIndex] as Row);
    }

    /**
     * Removes the given row.
     */
    removeRow(row : Row) {
        const index = this.body.children.indexOf(row);
        if (index >= 0) {
            this.removeRowByIndex(index);
        } else {
            throw new Error(`Attempted to remove unknown row: ${JSON.stringify(row.toModel())}`);
        }
    }

    /**
     * Removes the given row.
     * TODO: This assumes there are only rows, nothing else.
     */
    removeRowByIndex(rowIndex : number) {
        if (rowIndex >= 0 && rowIndex < this.body.children.length) {
            this.body.children.splice(rowIndex, 1);
        } else {
            throw new Error(`Attempted to remove invalid row index ${rowIndex}`);
        }
    }

    /**
     * Removes a specific widget.
     */
    removeWidget(widgetRef : Widget, recursive : boolean) {
        const index = this.body.children.findIndex(rhs => widgetRef === rhs);
        if (index >= 0) {
            // Immediatly found, what a success
            this.removeChildByIndex(index);
            return (true);
        } else if (recursive) {
            // Not found, but a child might be lucky enough.
            // Yes, this is a call to `some` with a side-effect. That actually is
            // a little creepy ...
            return (this.hostingChildren.some(c => c.removeWidget(widgetRef, recursive)));
        } else {
            // Not found and no recursion allowed.
            return (false);
        }
    }

    /**
     * Removes something at a specific index.
     */
    removeChildByIndex(index : number) {
        const length = this.children.length;
        if (index < 0 || index >= length) {
            throw new Error(`Attempted to remove child a ${index}, length is ${length}`);
        }
        
        this.children.splice(index, 1);
        this.markSaveRequired();
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

        this._referencedQueries.push(new QueryReference(this, ref));
        this.markSaveRequired();
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
     * @return All parameter names that need to be given to render this page.
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
    getQueryReferenceByName(name : string) : QueryReference  {
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
     * @return All immediate children of the page itself.
     */
    get children() : Widget[] {
        return (this.body.children);
    }

    /**
     * @return All children that may have children themselves.
     */
    get hostingChildren() :  WidgetHost[] {
        const toReturn : WidgetHost[] = (this.children.filter(isWidgetHost)) as any[];
        return (toReturn);
    }

    /**
     * @return All widgets that are in use on this page.
     */
    get allWidgets() : Widget[] {
        // Flattens each sub-level individually
        const impl = (items : any[]) => {
            let widgets : Widget[] = [];
            items.forEach(item => {
                // Store it if it's a child
                if (isWidget(item)) {
                    widgets.push(item);
                }
                
                // If this itself is a host, grab its children;
                if (isWidgetHost(item)) {
                    widgets = widgets.concat(impl(item.children));
                }
            });
                        
            return (widgets);
        }

        // Flattens the top level
        return ([].concat(...impl(this.body.children)));
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
     * @return True, if the following input could be provided. This may either happen via
     *         a input widget or a page GET parameter.
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

        if (this.body.children.length > 0) {
            toReturn.body = this.body.toModel() as BodyDescription;
        }

        if (this._parameters.length > 0) {
            toReturn.parameters = this._parameters.map(p => p.toModel());
        }
        
        return (toReturn);
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
