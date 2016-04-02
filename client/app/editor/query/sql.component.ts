import {Component, Input}               from 'angular2/core'
import {Pipe, PipeTransform}            from 'angular2/core'

import {ProjectService}                 from '../project.service'

import {Table}                          from '../../shared/table'
import {Query, Model, SyntaxTree}       from '../../shared/query'

@Component({
    selector : 'sql-expr',
    templateUrl : 'app/editor/query/templates/query-expr.html',
    directives: [ExpressionComponent]
})
class ExpressionComponent {
    @Input() expr : SyntaxTree.Expression;
    @Input() query : Query;

    private _currentDragOver : boolean = false;

    /**
     *
     */
    onConstantDrag(evt : DragEvent) {
        this._currentDragOver = true;
        // Indicates we can drop here
        evt.preventDefault();
    }

    /**
     *
     */
    onConstantDragLeave(evt : DragEvent) {
        this._currentDragOver = false;
    }

    onConstantDrop(evt : DragEvent) {
        this._currentDragOver = false;
        
        this.expr = this.expr.replaceSelf({
            constant : {
                type : "INTEGER",
                value : "13"
            }
        });

        evt.preventDefault();
    }

    get isCurrentDropTarget() : boolean {
        return (this._currentDragOver);
    }
}

@Component({
    selector : 'sql-select',
    templateUrl : 'app/editor/query/templates/query-select.html',
    directives: [ExpressionComponent]
})
class SelectComponent {
    @Input() select : SyntaxTree.Select;

    /**
     * 
     */
    get starExpression() {
        let toReturn = "";
        
        if (this.select.allData) {
            toReturn = "*";
            
            if (this.select.numberOfColumns == 0) {
                toReturn += ", ";
            }
        }
        
        return (toReturn);
    }
}

@Component({
    selector : 'sql-from',
    templateUrl : 'app/editor/query/templates/query-from.html',
})
class FromComponent {
    @Input() from : SyntaxTree.From;
}

@Component({
    selector : 'sql-where',
    templateUrl : 'app/editor/query/templates/query-where.html',
    directives: [ExpressionComponent]
})
class WhereComponent {
    @Input() query : Query;
}


/**
 * Transforms a query into its string expression.
 */
@Pipe({name: 'sqlString'})
export class SqlStringPipe implements PipeTransform {
    public transform(value : Query, args : string[]) : any {
        try {
            return (value.toSqlString());
        } catch (e) {
            return (e);
        }
    }
}

@Component({
    selector: 'sql-query',
    templateUrl: 'app/editor/query/templates/query.html',
    directives: [ExpressionComponent, SelectComponent, FromComponent, WhereComponent]
})
export class QueryComponent {
    @Input() query : Query;

    /**
     * Used for dependency injection.
     */
    constructor(private _projectService: ProjectService)
    {}
}
