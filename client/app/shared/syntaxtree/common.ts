import {Table}                          from '../table'
import {Model}                          from '../query.model'

import { loadExpression }               from './expression'

/**
 * Basic data types as inspired by SQLite.
 */
export enum DataType {
    Integer,
    Real,
    Text
}

/**
 * Translates "over the wire" representations of a datatype
 * to an enum.
 */
export function parseDataType(str : string) : DataType {
    switch (str) {
    case "INTEGER": return (DataType.Integer);
    case "REAL"   : return (DataType.Real);
    case "TEXT"   : return (DataType.Text);
    }

    throw { "error" : `parseDataType: Unknown datatype "${str}` };
}

/**
 * Translates enum representation of data type to "over the wire"
 * representation.
 */
export function serializeDataType(t : DataType) : Model.DataTypeStrings {
    switch(t) {
    case DataType.Integer: return "INTEGER";
    case DataType.Real   : return "REAL";
    case DataType.Text   : return "TEXT";
    }

    throw { "error" : `serializeDataType: Unknown datatype "${t}` };
}

/**
 * Something that is able to host an expression.
 */
export interface ExpressionParent {
    /**
     * Replaces a child of this expression. This is used by
     * outside components, which need a way to change the structure
     * of a query whilst leaving the "root pointer" intact.
     *
     * @param formerChild The instance that previously was a child
     * @param newChild    The instance that should take the place
     */
    replaceChild(formerChild : Expression, newChild : Expression) : void;
}


/**
 * Base class for all components of an SQL Statement (SELECT,
 * FROM, WHERE, GROUP BY, HAVING, ORDER BY). Additionally, this
 * models top level AND and OR conjunctions as top level components,
 * because this eases development for beginners.
 */
export abstract class Component {
    /**
     * @return SQL String representation
     */
    public abstract toString() : string;

    /**
     * @return JSON model representation
     */
    public abstract toModel() : any;
}

/**
 * Valid template identifiers. Sadly a leaky abstraction that needs
 * to be kept in sync with the templates.
 */
type TemplateId = "constant" | "column" | "binary" | "missing";

/**
 * Base class for all expressions, no matter how many arguments they
 * require or what the return type is.
 */
export abstract class Expression implements ExpressionParent {

    private _parent : ExpressionParent;
    
    /**
     * @param _templateidentifier The type of template needed to render
     *                            this expression.
     */
    constructor(private _templateIdentifier : TemplateId,
                parent : ExpressionParent) {
        this._parent = parent;
    }

    /**
     * Replaces this expression with the given expression in it's
     * parent.
     *
     * @return The new child
     */
    replaceSelf(newChildDesc : Model.Expression) : Expression {
        const newChild = loadExpression(newChildDesc, this._parent);
        this._parent.replaceChild(this, newChild);

        return (newChild);
    }

    abstract replaceChild(formerChild : Expression, newChild : Expression) : void;

    /**
     * Because the user can construct new Queries with "holes", not every
     * query can be represented as SQL string.
     *
     * @return true, if this expression could be turned into an SQL string.
     */
    abstract isComplete() : boolean;
    
    /**
     * @return SQL String representation
     */
    abstract toString() : string;

    /**
     * @return JSON model representation
     */
    abstract toModel() : any;

    /**
     * This is a more or less leaky abstraction, but the HTML rendering
     * template needs to know which kind of expression it is dealing
     * with. Ideally this model wouldn't need to do anything frontend-
     * related.
     *
     * @return The template identifier to use
     */
    get templateIdentifier() : TemplateId {
        return (this._templateIdentifier);
    }
}
