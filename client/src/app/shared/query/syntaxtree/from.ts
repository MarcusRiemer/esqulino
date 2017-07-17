import { Schema } from '../../schema'

import * as Model from '../description'
import { Query } from '../base'
import {
  ValidationResult, ValidationErrors, ValidationError
} from '../validation'

import {
  Component, Expression, ExpressionParent, Removable
} from './common'

import {
  loadExpression, MissingExpression
} from './expression'


/**
 * Base class for all joins.
 *
 * @todo This ignores the possibility of sub-SELECTs in the FROM
 *       clause.
 */
export abstract class Join implements Removable {
  protected _sqlJoinKeyword: string;

  protected _table: Model.TableNameDefinition;

  protected _from: From;

  /**
   * Stores base data
   */
  constructor(from: From, sqlJoinKeyword: string, table: Model.TableNameDefinition) {
    this._from = from;
    this._sqlJoinKeyword = sqlJoinKeyword;
    this._table = table;
  }

  /**
   * @return The name of the table that is JOINed
   */
  get tableName() {
    return (this._table.name);
  }

  get tableSchema() {
    return (this._from.query.getTableSchema(this._table.name));
  }

  /**
   * @return True, if this table actually exists (according to the schema)
   */
  get tableExists() {
    return (this._from.query.schema.hasTable(this.tableName));
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

  getLocationDescription(): string {
    return (this.sqlJoinKeyword);
  }

  /**
   * Removes this JOIN from the parenting FROM component.
   */
  removeSelf() {
    this._from.removeJoin(this);
  }

  /**
   * @return A string representing a join with a single table
   */
  abstract toSqlString(): string;

  abstract toModel(): Model.Join;
}

/**
 * Although there is not really a SQL keyword for this,
 * the first table in the FROM component needs to be
 * treated seperatly.
 */
export class InitialJoin extends Join {

  constructor(from: From, table: Model.TableNameDefinition) {
    // No SQL Keyword for the first statement
    super(from, "FROM", table);
  }

  toSqlString(): string {
    return this.nameWithAlias;
  }

  toModel(): Model.Join {
    return ({
      table: this._table
    });
  }
}

/**
 * Represents a cross join, no matter whether its using a
 * comma or the JOIN keyword.
 */
export class CrossJoin extends Join {
  constructor(from: From, join: Model.Join) {
    var separator: string;
    switch (join.cross) {
      case "comma":
        separator = ",";
        break;
      case "cross":
        separator = "JOIN"
        break;
      default:
        // This actually shouldn't happen, but in case something
        // is extended dynamically we make extra sure nothing
        // goes undetected.
        const joinType = (join as Model.Join).cross;
        throw new Error(`Unknown type in cross join: ${joinType}`);
    }

    super(from, separator, join.table);
  }

  toSqlString(): string {
    // There is no way around the separator and the name of
    // the table.
    return (`${this._sqlJoinKeyword} ${this.nameWithAlias}`);
  }

  toModel(): Model.Join {
    const crossType: Model.InnerJoinType = this._sqlJoinKeyword == ',' ? "comma" : "cross";

    return ({
      table: this._table,
      cross: crossType
    });
  }
}

/**
 * All types of INNER JOINs.
 */
export class InnerJoin extends Join implements ExpressionParent {
  private _using: string;
  private _on: Expression;

  constructor(from: From, join: Model.Join) {
    super(from, "INNER JOIN", join.table);

    // Ensure USING XOR ON
    if ((join.inner.on && join.inner.using) ||
      (!join.inner.on && !join.inner.using)) {
      throw { msg: "Only USING xor ON may be used" };
    }

    // Load expression would throw on a null value, so
    // we need to wrap this.
    if (join.inner.on) {
      this._on = loadExpression(join.inner.on, this);
    }

    this._using = join.inner.using;
  }

  toSqlString(): string {
    let method = (this._using) ? "USING" : "ON";
    let expr = (this._using) ? this._using : this._on.toSqlString();

    return (`${this._sqlJoinKeyword} ${this.nameWithAlias} ${method}(${expr})`);
  }

  toModel(): Model.Join {
    let toReturn: Model.Join = {
      table: this._table
    };

    if (this._on) {
      toReturn.inner = {
        on: this._on.toModel()
      }
    }

    if (this._using) {
      toReturn.inner = {
        using: this._using
      }
    }

    return (toReturn);
  }

  replaceChild(formerChild: Expression, newChild: Expression) {
    if (this._on == formerChild) {
      this._on = newChild;
    } else {
      throw new Error("Not implemented");
    }
  }

  getLocationDescription(): string {
    return ("INNER JOIN");
  }

  removeChild(formerChild: Expression) {
    if (this._on == formerChild) {
      this.replaceChild(formerChild, new MissingExpression({}, this));
    } else {
      throw new Error("Not implemented");
    }
  }
}

/**
 * The SQL FROM clause with 0..n subsequent JOINs.
 */
export class From extends Component {
  private _first: InitialJoin;
  private _joins: Join[] = [];

  constructor(from: Model.From, query: Query) {
    super(query);

    // The initial JOIN is guaranteed to be present, otherwise
    // the whole FROM component would be missing
    this._first = new InitialJoin(this, from.first);

    // Possibly adding subsequent joins.
    if (from.joins) {
      from.joins.forEach(this.addJoin, this);
    }
  }

  /**
   * @return All tables that are not used by this query.
   */
  get unusedTables() {
    return (this._query.schema.tables.filter(t => !this.isUsingTable(t.name)));
  }

  /**
   * @return True, if the given table is used in this query.
   */
  isUsingTable(tableName: string) {
    return (this.joinsAndInitial.find(j => j.tableName == tableName) != null);
  }

  /**
   * @return True, if the given alias is provided
   */
  isProvidingAlias(alias: string) {
    return (this.joinsAndInitial.find(j => j.alias == alias || j.tableName == alias));
  }

  /**
   * Reacts to missing tables and wrong expressions in JOINs.
   */
  validate(schema: Schema): ValidationResult {
    let errors: ValidationError[] = [];

    // Check for tables with names that don't exist in the schema
    this.joinsAndInitial.forEach(j => {
      if (!schema.hasTable(j.tableName)) {
        errors.push(new ValidationErrors.SchemaUnknownTable(j));
      }
    });

    // Group tables by name
    let grouped: { [tablename: string]: Join[] } = {};
    this.joinsAndInitial.forEach(j => {
      if (grouped[j.tableName]) {
        grouped[j.tableName].push(j)
      } else {
        grouped[j.tableName] = [j]
      }
    });

    // Check every group for duplicates
    for (let tableName in grouped) {
      let group = grouped[tableName];

      // Ensure there is only a single table in the group
      // or eveything has an alias.
      if (group.length > 1 && !group.every(j => !!j.alias)) {
        errors.push(new ValidationErrors.MissingTableAlias(tableName, "FROM"));
      }
    }

    // Ensure no duplicate identifiers are used
    let names: { [aliasname: string]: number } = {};

    this.joinsAndInitial.forEach(t => {
      // Count every alias that exists
      if (t.alias) {
        if (names[t.alias]) {
          names[t.alias]++;
        } else {
          names[t.alias] = 1;
        }
      }
    });

    // Report nun-unique names
    for (let alias in names) {
      if (names[alias] > 1) {
        errors.push(new ValidationErrors.AmbiguousTableAlias(alias));
      }
    }

    return (new ValidationResult(errors));
  }

  /**
   * @return The table that starts the JOIN-chain.
   */
  get first(): InitialJoin {
    return (this._first);
  }

  /**
   * @return The number of joins in the chain
   */
  get numberOfJoins(): number {
    return (this._joins.length);
  }

  /**
   * @return Accessing all join apart from the first
   */
  get joins(): Join[] {
    return (this._joins);
  }

  /**
   * @return All joins, including the initially mentioned table
   */
  get joinsAndInitial(): Join[] {
    return ([this._first].concat(this._joins));
  }

  /**
   * @return All joins, as long as they have a corresponding schema
   */
  get existingJoinsAndInitial(): Join[] {
    return (this.joinsAndInitial.filter(j => j.tableExists));
  }

  getLeaves(): Expression[] {
    return ([]);
  }

  /**
   * @param n Starting at 0
   * @return The n-th join of this FROM clause
   */
  getJoin(n: number): Join {
    return (this._joins[n]);
  }

  /**
   * Appends the given JOIN to the list of current JOINs.
   *
   * @param toAdd The definition of the JOIN to add
   *
   * @return A SyntaxTree.Join instance matching the type of the model.
   */
  addJoin(toAdd: Model.Join) {
    let toReturn: Join;

    // Construct an instance of a matching type
    if (toAdd.cross) {
      toReturn = new CrossJoin(this, toAdd);
    } else if (toAdd.inner) {
      toReturn = new InnerJoin(this, toAdd);
    } else {
      throw new Error(`Unknown JOIN type: ${toAdd}`);
    }

    // Persist the new instance
    this._joins.push(toReturn);

    return (toReturn);
  }

  /**
   * Removes a specific JOIN instance that is already part
   * of this FROM clause.
   */
  removeJoin(toRemove: Join) {
    // Is this the only table that is part of the FROM clause?
    if (this._first === toRemove && this._joins.length === 0) {
      throw new Error("Can't remove only table");
    }

    // Do we need to re-assign the first item?
    if (this._first === toRemove) {
      // Remove an item from the list of subsequent JOINs
      const newInitial = this._joins.pop();

      // And make it the new inital JOIN
      const newInitialTable = newInitial.toModel().table;
      this._first = new InitialJoin(this, newInitialTable);
    } else {
      // Remove JOIN from list of subsequent JOINs
      const removalIndex = this._joins.indexOf(toRemove);
      if (removalIndex >= 0) {
        this._joins.splice(removalIndex, 1);
      } else {
        throw new Error("Attempted to remove not existing JOIN");
      }
    }
  }

  /**
   * Re-arranges the JOIN instances of a FROM component.
   * @param toMove The Join that should be moved
   * @param newIndex The new index
   */
  moveJoin(toMove: Join, newIndex: number) {
    let newOrder = this.joinsAndInitial;
    const fromIndex = newOrder.indexOf(toMove);
    newOrder.splice(newIndex, 0, newOrder.splice(fromIndex, 1)[0]);

    // This possibly requires changed types
    this._first = new InitialJoin(this, newOrder.shift().toModel().table);;
    this._joins = newOrder.map(j => {
      if (j instanceof InitialJoin) {
        return (new CrossJoin(this, { cross: "cross", table: j.toModel().table }));
      } else {
        return j;
      }
    });
  }

  /**
   * @return The SQL-string-representation of this clause
   */
  toSqlString(): string {
    let toReturn = `FROM ${this._first.nameWithAlias}`;

    this._joins.forEach(j => {
      toReturn += "\n\t" + j.toSqlString();
    });

    return (toReturn);
  }

  /**
   * @return A description that could be used to create a new
   *         instance that is equal to this instance.
   */
  toModel(): Model.From {
    let toReturn: Model.From = {
      first: this._first.toModel().table,
    };

    if (this._joins.length > 0) {
      toReturn.joins = this._joins.map(j => j.toModel());
    }

    return (toReturn);
  }
}
