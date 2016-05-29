/**
 * Describes a paragraph widget.
 */
export interface ParagraphDescription extends WidgetDescription {
    text : string
}

export interface WidgetDescription {

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
    id : string
    name : string

    rows : RowDescription[]
}
