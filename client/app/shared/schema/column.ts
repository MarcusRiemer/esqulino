import {Project}                              from '../project'
import {ProjectResource}                      from '../resource'
import {ColumnDescription, TableDescription}  from './schema.description'

export enum ColumnStatus {
    new = 1,
    changed = 2,
    deleted = 3,
    unchanged = 4
}

export class Column {
    index : number
    name : string
    type : string
    not_null : boolean
    dflt_value? : string
    primary : boolean
    state : ColumnStatus

    constructor(desc : ColumnDescription, state : ColumnStatus) {
         //super(project, desc);
         this.index = desc.index;
         this.name = desc.name;
         this.type = desc.type;
         this.not_null = desc.not_null;
         this.dflt_value = desc.dflt_value;
         this.primary = desc.primary;
         this.state = state;
    }

    setState(state : ColumnStatus) {
        this.state = state;
    }

    toModel() : ColumnDescription { 
        const toReturn : ColumnDescription = {
            name : this.name,
            index : this.index,
            type : this.type,
            not_null : this.not_null,
            dflt_value : this.dflt_value,
            primary : this.primary
        };
        return toReturn;
    }
}