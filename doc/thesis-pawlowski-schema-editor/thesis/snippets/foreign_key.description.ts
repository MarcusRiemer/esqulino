export interface ForeignKeyDescription {
    refs : {
        to_table : string
        from_column : string
        to_column : string        
    }[];
}