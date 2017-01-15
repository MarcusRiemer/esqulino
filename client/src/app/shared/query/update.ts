import {Schema}                           from '../schema'

import {ValidationResult, Validateable}   from './validation'
import {Query, QueryWhere}                from './base'
import * as Model                         from './description'
import * as SyntaxTree                    from './syntaxtree'


/**
 * An assignment that happens during an update.
 */
class UpdateAssign implements SyntaxTree.ExpressionParent {

    private _query : QueryUpdate;
    private _columnName : string;
    private _expr : SyntaxTree.Expression;
    
    constructor(query : QueryUpdate, model : Model.ColumnAssignment) {
        this._query = query;
        this._columnName = model.column;
        this._expr = SyntaxTree.loadExpression(model.expr, this);
    }

    /**
     * @return The expression that is used in this assignment.
     */
    get expr() : SyntaxTree.Expression {
        return (this._expr);
    }

    replaceChild(formerChild : SyntaxTree.Expression, newChild : SyntaxTree.Expression) : void {
        throw new Error("Not implemented");
    }

    /**
     * Removing a former child replaces it by a missing expression.
     */
    removeChild(formerChild : SyntaxTree.Removable) : void {
        if (this._expr == formerChild) {
            this._expr = SyntaxTree.loadExpression({ missing : {}}, this);
        } else {
            throw new Error("Not implemented");
        }
    }

    getLocationDescription() : string {
        return ("update");
    }

    toSqlString() : string {
        return (`${this._columnName} = ${this._expr.toSqlString()}`);
    }

    toModel() : Model.ColumnAssignment {
        return ({
            column : this._columnName,
            expr : this._expr.toModel()
        });
    }
}

/**
 * An SQL UPDATE query.
 */
export class QueryUpdate extends Query implements QueryWhere {
    // The table this statement modifies.
    private _tableName : string;

    private _where : SyntaxTree.Where;

    private _updates : UpdateAssign[];

    constructor(schema : Schema, model : Model.QueryDescription) {
        super (schema, model);

        // Store table name, a FROM component would be overkill
        this._tableName = model.update.table;

        // Possibly load the WHERE clause
        if (model.where) {
            this._where = new SyntaxTree.Where(model.where, this);
        }

        // Load assignment expressions
        this._updates = model.update.assignments.map( a => new UpdateAssign(this, a));
    }

    /**
     * @return The name of the table new data will be inserted to
     */
    get tableName() {
        return (this._tableName);
    }

    /**
     * @return The WHERE clause this UPDATE component uses.
     */
    get where() {
        return (this._where);
    }

    replaceChild(formerChild : SyntaxTree.Expression, newChild : SyntaxTree.Expression) : void {
        throw new Error("Not implemented");
    }

    removeChild(formerChild : SyntaxTree.Removable) : void {
        throw new Error("Not implemented");
    }

    protected validateImpl(schema : Schema) : ValidationResult {
        let errors = this._updates.map(v => v.expr.validate(schema));
        if (this._where) {
            errors.push(this._where.validate(schema))
        }

        return (new ValidationResult([], errors));
    }

    /**
     * Serializes the whole query to the "over-the-wire" format.
     * @return The "over-the-wire" JSON representation
     */
    protected toModelImpl(toReturn : Model.QueryDescription) : Model.QueryDescription {

        if (this._where) {
            toReturn.where = this._where.toModel();
        }

        toReturn.update = {
            table : this._tableName,
            assignments : this._updates.map(a => a.toModel())
        }

        return (toReturn);
    }

    /**
     * Calculates the SQL String representation of this query.
     */
    protected toSqlStringImpl() : string {
        const values = this._updates.map(u => u.toSqlString()).join(", ");
        
        let toReturn = `UPDATE ${this.tableName}\nSET ${values}`;        
        
        return (toReturn);
    }

    public getLeaves() : SyntaxTree.Expression[] {
        let updates : SyntaxTree.Expression[] = [];

        if (this._updates) {
            const updatesNested = this._updates.map(u => u.expr.getLeaves());
            updates = [].concat.apply([], updatesNested);
        }

        const where = this._where ? this.where.getLeaves() : [];
        
        return (updates.concat(where));
    }

}
