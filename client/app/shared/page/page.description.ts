/**
 * Describes a paragraph widget.
 */
export interface ParagraphDescription extends WidgetDescription {
    text : string,
    type : "paragraph"
}

/**
 * A widget **requires** at least a type, all other fields are
 * mandated by deriving descriptions.
 */
export interface WidgetDescription {
    type : string
    [x: string]: any 
}

/**
 * Describes a column that can host certain widgets
 */
export interface ColumnDescription {
    width : number
    // TODO: The any[] option is only here to allow generation of
    //       correct JSON schemas, see
    //       https://github.com/YousefED/typescript-json-schema/issues/44
    widgets : any[]
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
     * these queries provide additional DB information that can
     * be used on this page.
     */
    referencedQueries : string[]
}

