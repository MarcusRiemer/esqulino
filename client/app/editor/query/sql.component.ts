import {Component, Input}               from 'angular2/core'
import {Pipe, PipeTransform}            from 'angular2/core'

import {Table}                          from '../../shared/table'
import {Query, Model, SyntaxTree}       from '../../shared/query'

import {ProjectService}                 from '../project.service'

import {DragService}                    from './drag.service'
import {SelectComponent}                from './sql.select.component'
import {DeleteComponent}                from './sql.delete.component'
import {FromComponent}                  from './sql.from.component'
import {WhereComponent}                 from './sql.where.component'

/**
 * Transforms a query into its string expression.
 */
@Pipe({name: 'sqlString'})
export class SqlStringPipe implements PipeTransform {
    public transform(value : Query, args : string[]) : any {
        try {
            return (value.toSqlString());
        } catch (e) {
            return (JSON.stringify(e));
        }
    }
}

@Component({
    selector: 'sql-query',
    templateUrl: 'app/editor/query/templates/query.html',
    directives: [SelectComponent, DeleteComponent, FromComponent, WhereComponent],
    pipes: [SqlStringPipe]
})
export class QueryComponent {
    @Input() query : Query;

    /**
     * Used for dependency injection.
     */
    constructor(private _projectService: ProjectService)
    {}
}
