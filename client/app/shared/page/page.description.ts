/**
 * Describes a paragraph widget.
 */
export interface ParagraphDiscription {
    text : string;
}    

/**
 * Describes a column that can host certain widgets
 */
export interface ColumnDescription {
    width : number;
}

/**
 * Describes a row that can host certain cells.
 */
export interface RowDescription {
    columns : ColumnDescription[];
}

/**
 * Describes a page as a whole
 */
export interface PageDescription {
    id : string
    name : string

    rows : RowDescription[];
}
