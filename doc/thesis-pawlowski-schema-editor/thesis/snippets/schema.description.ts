export interface ColumnDescription {
    index : number
    name : string
    type : string
    not_null : boolean
    dflt_value? : string
    primary : boolean
}

export interface TableDescription {
    name : string
    columns : ColumnDescription[]
}