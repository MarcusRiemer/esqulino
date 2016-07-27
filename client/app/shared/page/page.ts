import {Project}                              from '../project'
import {ProjectResource}                      from '../resource'
import {Query}                                from '../query'

import {
    PageDescription, QueryReferenceDescription, WidgetDescription,
    ValueReferenceDescription, ColumnReferenceDescription,
    ColumnDescription, RowDescription
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
    ValueReference, ColumnReference, QueryReference
}

/**
 * The in-memory representation of a page.
 */
export class Page extends ProjectResource {
    private _rows : Row[];
    private _referencedQueries : QueryReference[]
    private _renderer : Renderer;
    
    constructor(desc : PageDescription, project? : Project) {
        super(desc.id, desc.name, project);

        // We only render stuff via liquid for the moment
        this._renderer = new LiquidRenderer();

        // Map descriptions to actual representations
        this._rows = desc.rows.map(rowDesc => new Row(rowDesc, this));

        // Making a copy of those references
        this._referencedQueries = desc.referencedQueries.map(refDesc => new QueryReference(project, this, refDesc));
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

    hasUserInput(name : string) {
        const parametrized = this.allWidgets.filter(w => w instanceof UserInputWidget) as UserInputWidget[];

        return (parametrized.some(p => p.providesParameter(name)));
    }

    toModel() : PageDescription {
        return ({
            id : this.id,
            name : this.name,
            rows : this._rows.map(r => r.toModel()),
            referencedQueries : this._referencedQueries.map(r => r.toModel())
        });
    }
}
