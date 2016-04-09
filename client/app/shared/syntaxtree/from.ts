import {Model}              from '../query.model'

import {loadExpression}     from './expression'
import {
    Component, Expression, ExpressionParent
} from './common'


/**
 * Base class for all joins.
 *
 * @todo This ignores the possibility of sub-SELECTs in the FROM
 *       clause.
 */
abstract class Join {
    protected _sqlJoinKeyword : string;

    protected _table : Model.TableNameDefinition;

    /**
     * Stores base data
     */
    constructor(sqlJoinKeyword : string, table : Model.TableNameDefinition) {
        this._sqlJoinKeyword = sqlJoinKeyword;
        this._table = table;
    }

    /**
     * @return The name of the table that is JOINed
     */
    get name() {
        return (this._table.name);
    }

    /**
     * @return the alias name of the JOINed table
     */
    get alias() {
        return (this._table.alias);
    }

    /**
     * This is not exactly nice, but the frontend templating engine
     * needs to display something.
     *
     * @return The used JOIN Method
     */
    get sqlJoinKeyword() {
        return (this._sqlJoinKeyword);
    }

    /**
     * @return The name of this table with it's alias, if there is an
     * alias given.
     */
    get nameWithAlias() {
        let toReturn = this._table.name;

        // But the alias is optional
        if (this._table.alias) {
            toReturn += ` ${this._table.alias}`;
        }

        return (toReturn);
    }

    /**
     * @return A string representing a join with a single table
     */
    abstract toString() : string;

    abstract toModel() : Model.Join;
}

/**
 * Although there is not really a SQL keyword for this,
 * the first table in the FROM component needs to be
 * treated seperatly.
 */
export class InitialJoin extends Join {

    constructor(table : Model.TableNameDefinition) {
        // No SQL Keyword for the first statement
        super(null, table);
    }

    toString() : string {
        return this.nameWithAlias;
    }

    toModel() : Model.Join {
        return ({
            table : this._table
        });
    }
}

/**
 * Represents a cross join, no matter whether its using a
 * comma or the JOIN keyword.
 */
export class CrossJoin extends Join {
    constructor(join : Model.Join) {
        var separator : string;
        switch(join.cross) {
        case "comma":
            separator = ",";
            break;
        case "cross":
            separator = "JOIN"
            break;
        default:
            throw `Unknown type in cross join: ${join.cross}`;
        }

        super(separator, join.table);
    }

    toString() : string {
        // There is no way around the separator and the name of
        // the table.
        return (`${this._sqlJoinKeyword} ${this.nameWithAlias}`);
    }

    toModel() : Model.Join {
        const crossType = this._sqlJoinKeyword == ',' ? "comma" : "cross";
        
        return ({
            table : this._table,
            cross : crossType
        });
    }
}

/**
 * All types of INNER JOINs.
 */
export class InnerJoin extends Join implements ExpressionParent {
    private _using : string;
    private _on : Expression;

    constructor(join : Model.Join) {
        super("INNER JOIN", join.table);

        // Ensure USING XOR ON
        if ((join.inner.on && join.inner.using) ||
            (!join.inner.on && !join.inner.using)) {
            throw { msg : "USING ^ ON check failed" };
        }

        // Load expression would throw on a null value, so
        // we need to wrap this.
        if (join.inner.on) {
            this._on = loadExpression(join.inner.on, this);
        }

        this._using = join.inner.using;
    }

    toString() : string {
        let method = (this._using) ? "USING" : "ON";
        let expr = (this._using) ? this._using : this._on.toString();

        return (`${this._sqlJoinKeyword} ${this.nameWithAlias} ${method}(${expr})`);
    }

    toModel() : Model.Join {
        let toReturn : Model.Join = {
            table : this._table
        };

        if (this._on) {
            toReturn.inner = {
                on : this._on.toModel()
            }
        }

        if (this._using) {
            toReturn.inner = {
                using : this._using
            }
        }
        
        return (toReturn);
    }

    replaceChild(formerChild : Expression, newChild : Expression) {
        if (this._on == formerChild) {
            this._on = newChild;
        } else {
            throw { err : "Not implemented" }
        }
    }
}

/**
 * The SQL FROM clause with 0..n subsequent JOINs.
 */
export class From extends Component {
    private _first : InitialJoin;
    private _joins : Join[] = [];

    constructor(from : Model.From) {
        super();

        this._first = new InitialJoin(from.first);

        if (from.joins) {
            from.joins.forEach(j => {
                if(j.cross) {
                    this._joins.push(new CrossJoin(j));
                } else if (j.inner) {
                    this._joins.push(new InnerJoin(j));
                } else {
                    throw `Unknown JOIN type: ${j.cross}`;

                }
            });
        } else {
            // There should at least be a list
            this._joins = [];
        }
    }

    /**
     * @return At the present state, the FROM component must be complete.
     */
    get isComplete() : boolean {
        return (true);
    }

    /**
     * @return The table that starts the JOIN-chain.
     */
    get first() : InitialJoin {
        return (this._first);
    }

    /**
     * @return The number of joins in the chain
     */
    get numberOfJoins() : number {
        return (this._joins.length);
    }

    /**
     * @return Accessing all joins together
     */
    get joins() : Join[] {
        return (this._joins);
    }

    /**
     * @param n Starting at 0
     * @return The n-th join of this FROM clause
     */
    getJoin(n : number) : Join {
        return (this._joins[n]);
    }

    /**
     * @return The SQL-string-representation of this clause
     */
    toString() : string {
        let toReturn = `FROM ${this._first.nameWithAlias}`;

        this._joins.forEach(j => {
            toReturn += "\n\t" + j.toString();
        });

        return (toReturn);
    }

    toModel() : Model.From {
        let toReturn : Model.From = {
            first : this._first.toModel().table,
        };

        if (this._joins.length > 0) {
            toReturn.joins = this._joins.map( j => j.toModel());
        }
        
        return (toReturn);
    }
}
