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
    _state : ColumnStatus

    constructor(desc : ColumnDescription, state : ColumnStatus) {
         this.index = desc.index;
         this.name = desc.name;
         this.type = desc.type;
         this.not_null = desc.not_null;
         this.dflt_value = desc.dflt_value;
         this.primary = desc.primary;
         this._state = state;
    }

    setState(state : ColumnStatus) {
        this._state = state;
    }

    get state() {
        if(this._state == ColumnStatus.changed) {
            return("changed");
        } else if(this._state == ColumnStatus.unchanged) {
            return("unchanged");
        } else if(this._state == ColumnStatus.new) {
            return("new");
        } else if(this._state == ColumnStatus.deleted) {
            return("deleted");
        }
        return("undefined");
    }
}