import {Component}                      from 'angular2/core';
import {Pipe, PipeTransform}            from 'angular2/core';

import {Table}                          from '../shared/table';
import {Query, Model}                   from '../shared/query';

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
