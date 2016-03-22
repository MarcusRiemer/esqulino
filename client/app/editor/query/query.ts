import {Component, Input}               from 'angular2/core';
import {Pipe, PipeTransform}            from 'angular2/core';

import {Table}                          from '../../shared/table';
import {Query, Model, SyntaxTree}       from '../../shared/query';

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
    selector : 'sql-expr',
    templateUrl : 'app/editor/query/templates/query-expr.html',
    directives: [ExpressionComponent]
})
class ExpressionComponent {
    @Input() expr : SyntaxTree.Expression;

    //
    private _currentDragOver : boolean = false;

    onConstantClick() {
        let constant = <SyntaxTree.ConstantExpression> this.expr;
        constant.value = prompt("New Value?", constant.value);

        console.log(constant.value);

        return (true);
    }

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
        this.expr = new SyntaxTree.ConstantExpression({
            type : "INTEGER",
            value : "13"
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
class SelectComponent extends SqlComponent {
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
class FromComponent extends SqlComponent {
    @Input() from : SyntaxTree.From;
}

@Component({
    selector : 'sql-where',
    templateUrl : 'app/editor/query/templates/query-where.html',
    directives: [ExpressionComponent]
})
class WhereComponent extends SqlComponent {
    @Input() where : SyntaxTree.Where;
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
}
