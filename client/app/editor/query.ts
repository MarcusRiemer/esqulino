import {Component}                      from 'angular2/core';
import {Pipe, PipeTransform}            from 'angular2/core';

import {Table}                          from './table';

/**
 * Maps the JSON structure that is used to represent the data
 * behind the queries.
 */
module Model {
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

    export interface Query {
        select : Select;
        from : From[];
    }
}

class Editable {
    public editing = false;

    invertEdit() {
        this.editing = !this.editing;
    }
}

@Component({
    selector : 'sql-select',
    templateUrl : 'app/editor/templates/query-select.html',
    inputs: ['select'],
})
class SelectComponent extends Editable {
    public select : Model.Select;
}

@Component({
    selector : 'sql-from',
    templateUrl : 'app/editor/templates/query-from.html',
    inputs: ['from'],
})
class FromComponent extends Editable {
    public from : Model.From;
}

export class Query {
    public schema : Table[];
    public model : Model.Query;
    
    constructor(schema : Table[], model : Model.Query) {
        this.schema = schema;
        this.model = model;
    }
}

/**
 * Transforms a query into its string expression.
 */
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
    pipes: [SqlStringPipe],
    directives: [SelectComponent, FromComponent]
})
export class QueryComponent {
    public query : Query;
}
