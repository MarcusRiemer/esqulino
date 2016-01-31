import {Component}                      from 'angular2/core';
import {Pipe, PipeTransform}            from 'angular2/core';

import {Table}                          from './table';

export interface Select {
    columns : SelectColumn[];
}

export interface SelectColumn {
    column : string;
    asName : string;
}

export interface From {
    table : string;
    alias : string;
}

export interface QueryModel {
    select : Select;
    from : From[];
}

export class Query {
    public schema : Table[];
    public model : QueryModel;
    
    constructor(schema : Table[], model : QueryModel) {
        this.schema = schema;
        this.model = model;
    }
}

@Pipe({name: 'sqlString'})
export class SqlStringPipe implements PipeTransform {
    public transform(value : Query, args : string[]) : any {
        var selectColumns = "";

        for (var i = 0; i < value.model.select.columns.length; ++i) {
            if (i != 0) {
                selectColumns += ", ";
            }

            var column = value.model.select.columns[i];
            selectColumns += `${column.column} AS ${column.asName}`;
        }

        var fromSeries = value.model.from[0].table;

        return (`SELECT ${selectColumns}\nFROM ${fromSeries}`);
    }
}

@Component({
    selector: 'sql-query',
    templateUrl: 'app/editor/templates/query.html',
    inputs: ['query'],
    pipes: [SqlStringPipe]
})
export class QueryComponent {
    public query : Query;
}
