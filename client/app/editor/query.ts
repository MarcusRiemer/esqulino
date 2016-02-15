import {Component}                      from 'angular2/core';
import {Pipe, PipeTransform}            from 'angular2/core';

import {Table}                          from './table';

/**
 * Maps the JSON structure that is used to represent the data
 * over the wire or on disk.
 */
module Model {

    export interface Expression {
        type : string;
    }
    
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
        joins? : Join[];
    }

    export interface Join {
        table : string,
        alias : string,
        type : string
    }

    export interface Query {
        select : Select;
        from : From;   
    }
}

/**
 * The internal representation of an SQL query.
 */
module SyntaxTree {
    class Node {
        
    }

    class Expression extends Node {
        
    }
}

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export class Query {
    public schema : Table[];
    public model : Model.Query;
    
    constructor(schema : Table[], model : Model.Query) {
        this.schema = schema;
        this.model = model;
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    public toSqlString() : string {
        var selectColumns = "";

        // Putting together the comma separated columns in the
        // select statement.
        for (var i = 0; i < this.model.select.columns.length; ++i) {
            if (i != 0) {
                selectColumns += ", ";
            }

            var column = this.model.select.columns[i];
            selectColumns += `${column.column} AS ${column.asName}`;
        }

        // Putting together the JOIN separated tables in the
        // FROM component of this query, starting with a single table.
        var fromSeries = this.model.from.table;

        for (var i = 0; i < this.model.from.joins.length; ++i) {
            var join = this.model.from.joins[i];

            var keyword : string;
            switch(join.type) {
            case "comma":
                keyword = ",";
            case "cross":
                keyword = "JOIN";
            }

            fromSeries += `\n\t${keyword} ${join.table} ${join.alias}`;
        }
        
        return (`SELECT ${selectColumns}\nFROM ${fromSeries}`);
    }

    public toModel() : Model.Query {
        return (null);
    }
}


/**
 * Base class for all SQL top-level components.
 */
class Editable {
    public isEditing = false;

    invertEdit() {
        this.isEditing = !this.isEditing;
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

/**
 * Transforms a query into its string expression.
 */
@Pipe({name: 'sqlString'})
export class SqlStringPipe implements PipeTransform {
    public transform(value : Query, args : string[]) : any {
        return (value.toSqlString());
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
