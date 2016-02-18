import {Component, Input}               from 'angular2/core';
import {Pipe, PipeTransform}            from 'angular2/core';

import {Table}                          from '../shared/table';
import {Query, Model, SyntaxTree}       from '../shared/query';

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
})
class SelectComponent extends Editable {
    @Input() select : SyntaxTree.Select;
}

@Component({
    selector : 'sql-from',
    templateUrl : 'app/editor/templates/query-from.html',
})
class FromComponent extends Editable {
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
    directives: [SelectComponent, FromComponent]
})
export class QueryComponent {
    public query : Query;
}
