/**
 * Describes a paragraph widget.
 */
export interface ParagraphDescription extends WidgetDescription {
    text : string,
    type : "paragraph"
}

export interface WidgetDescription {
    type : string
}

/**
 * Describes a column that can host certain widgets
 */
export interface ColumnDescription {
    width : number
    widgets : WidgetDescription[]
}

/**
 * Describes a row that can host certain cells.
 */
export interface RowDescription {
    columns : ColumnDescription[]
}

/**
 * Describes a page as a whole
 */
export interface PageDescription {
    /**
     * The (at least) project-wide unique ID of this page.
     */
    id : string

    /**
     * A user-defined name of this page.
     */
    name : string

    /**
     * Rows are the top-level element for the whole layout,
     * for the moment no other type of widget is expected.
     */
    rows : RowDescription[]

    /**
     * IDs of queries that are referenced in this page. Only
     * these queries provide 
     */
    referencedQueries : string[]
}
