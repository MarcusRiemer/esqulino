import {Table}                          from '../table'
import {Model}                          from '../query.model'

import { Expression, loadExpression }   from './expression'

export { Expression, loadExpression }

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
 * A part of an SQL expression that can remove it's own reference from
 * the parenting query "thing".
 */
export interface Removable {
    removeSelf() : void;
}

/**
 * Something that can host something that can remove itself.
 */
export interface RemovableHost {
     /**
      * Removes a child of this expression. This is used by
      * outside components, which need a way to change the structure
      * of a query whilst leaving the "root pointer" intact.
      *
      * This method may replace the formerChild with a MissingExpression
      * or recursively remove itself.
      *
      * @param formerChild The instance that previously was a child
      */
    removeChild(formerChild : Removable) : void;
}

/**
 * Something that is able to host an expression.
 */
export interface ExpressionParent extends RemovableHost {
    /**
     * Replaces a child of this expression. This is used by
     * outside components, which need a way to change the structure
     * of a query whilst leaving the "root pointer" intact.
     *
     * @param formerChild The instance that previously was a child
     * @param newChild    The instance that should take the place
     */
    replaceChild(formerChild : ExpressionParent, newChild : ExpressionParent) : void;
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

