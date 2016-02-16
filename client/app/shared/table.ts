export interface Column {
    index : number;
    name : string;
    type : string;
    not_null : boolean;
    dflt_value : string;
    primary : boolean;
}

export interface Table {
    name : string;
    columns : Column[];
}
