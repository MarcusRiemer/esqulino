/**
 * The "over-the-wire" description of a single column
 * inside a table.
 */
export interface ColumnDescription {
    index : number;
    name : string;
    type : string;
    not_null : boolean;
    dflt_value : string;
    primary : boolean;
}

/**
 * The "over-the-wire" description of a single table 
 * with all of its columns.
 */
export interface TableDescription {
    name : string;
    columns : ColumnDescription[];
}
