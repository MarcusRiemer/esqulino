import {
    PageDescription, ReferencedQuery, WidgetDescription
} from './page.description'
import {Row, RowDescription}                  from './widgets/row'
import {Renderer, LiquidRenderer}             from './renderer/liquid'

export {PageDescription, ReferencedQuery}

/**
 * The in-memory representation of a page.
 */
export class Page {
    private _id : string;
    private _name : string;
    private _rows : Row[];
    private _referencedQueries : ReferencedQuery[]
    private _renderer : Renderer;

    private _isDirty = false;
    
    constructor(desc : PageDescription) {
        this._id = desc.id;
        this._name = desc.name;

        // We only render stuff via liquid for the moment
        this._renderer = new LiquidRenderer();

        // Map descriptions to actual representations
        this._rows = desc.rows.map(rowDesc => new Row(rowDesc));

        // Making a copy of those references
        this._referencedQueries = desc.referencedQueries.splice(0);
    }

    /**
     * @return The name the user has given to this page
     */
    get name() {
        return (this._name);
    }

    /**
     * @param newName The new name to set
     */
    set name(newName : string) {
        this._name = newName;
        this.markDirty();
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
        const newRow = new Row(newRowDesc);
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

    removeWidget(rowIndex : number, columnIndex : number, widgetIndex : number) {
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
        column.removeWidget(widgetIndex);

        this.markDirty();
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
    get referencedQueries() : ReferencedQuery[] {
        return (this._referencedQueries);
    }

    /**
     * @return True, if this instance has changes that could be saved..
     */
    get isDirty() {
        return (this._isDirty);
    }

    /**
     * Called when a query has been made to this change.
     */
    protected markDirty() : void {
        this._isDirty = true;
    }


    /**
     * @param queryId The ID of the query in question.
     *
     * @return True, if this query is used by this page.
     */
    isUsingQuery(queryId : string) {
        return (this._referencedQueries.some(ref => queryId == ref.queryId));
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
