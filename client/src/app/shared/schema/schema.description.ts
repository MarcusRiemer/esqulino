/**
 * The "over-the-wire" description of a single column
 * inside a table.
 */
export interface ColumnDescription {
    index : number
    name : string
    type : string
    not_null : boolean
    dflt_value? : string
    primary : boolean
}

export interface ForeignKeyDescription {
    refs : {
        to_table : string
        from_column : string
        to_column : string        
    }[];
}

/**
 * The "over-the-wire" description of a single table 
 * with all of its columns.
 */
export interface TableDescription {
    name : string
    columns : ColumnDescription[]
    // TODO: Implement in Table-class
    // foreign_keys : ForeignKeyDescription[]
}

