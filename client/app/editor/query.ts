import {Component, Input}               from 'angular2/core';
import {Pipe, PipeTransform}            from 'angular2/core';

import {Table}                          from '../shared/table';
import {Query, Model, SyntaxTree}       from '../shared/query';

/**
 * Base class for all SQL top-level components.
 */
class SqlComponent {
    public isEditing = false;

    /**
     * The width specification of the keyword part of a
     * bootstrap column, e.g. "col-xs-10".
     *
     * @return Whitespace delimited bootstrap column specifiers
     */
    public get bootstrapColsKeyword() {
        return ("col-xs-2 col-lg-1")
    }

    /**
     * The width specification of the expression part of a
     * bootstrap column, e.g. "col-xs-10".
     *
     * @return Whitespace delimited bootstrap column specifiers
     */
    public get bootstrapColsExpr() {
        return ("col-xs-10 col-lg-11");
    }

    /**
     * Toggles editing mode
     */
    invertEdit() {
        this.isEditing = !this.isEditing;
    }
}

@Component({
    selector : 'sql-select',
    templateUrl : 'app/editor/templates/query-select.html',
})
class SelectComponent extends SqlComponent {
    @Input() select : SyntaxTree.Select;
}

@Component({
    selector : 'sql-from',
    templateUrl : 'app/editor/templates/query-from.html',
})
class FromComponent extends SqlComponent {
    @Input() from : Model.From;
}

@Component({
    selector : 'sql-where',
    templateUrl : 'app/editor/templates/query-where.html',
})
class WhereComponent extends SqlComponent {
    @Input() from : Model.From;
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
    directives: [SelectComponent, FromComponent, WhereComponent]
})
export class QueryComponent {
    public query : Query;
}
