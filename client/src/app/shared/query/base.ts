import { Project } from '../project'
import { ProjectResource, CURRENT_API_VERSION } from '../resource'
import { Schema } from '../schema'

import {
  Validateable, ValidationResult, ValidationError, ValidationErrors
} from './validation'
import * as Model from './description'
import * as SyntaxTree from './syntaxtree'

/**
 * Facade for a query that allows meaningful mapping to the UI.
 */
export class Query extends ProjectResource implements SyntaxTree.RemovableHost, Validateable {

  public schema: Schema;

  /**
   * True, if this query always returns a single row.
   */
  private _singleRow: boolean = false;

  /**
   * All components that are part of this query.
   */
  private _components: {
    insert?: SyntaxTree.Insert
    select?: SyntaxTree.Select
    update?: SyntaxTree.Update
    delete?: SyntaxTree.Delete
    from?: SyntaxTree.From
    where?: SyntaxTree.Where
  } = {};

  /**
   * Stores all basic information about a string.
   */
  constructor(schema: Schema, model: Model.QueryDescription, project?: Project) {
    super(project, model);
    this.schema = schema;
    this._singleRow = !!model.singleRow;

    if (model.insert) {
      this._components.insert = new SyntaxTree.Insert(model.insert, this);
    }

    if (model.select) {
      this._components.select = new SyntaxTree.Select(model.select, this);
    }

    if (model.update) {
      this._components.update = new SyntaxTree.Update(model.update, this);
    }

    if (model.delete) {
      this._components.delete = new SyntaxTree.Delete(model.delete, this);
    }

    if (model.from) {
      this._components.from = new SyntaxTree.From(model.from, this);
    }

    if (model.where) {
      this._components.where = new SyntaxTree.Where(model.where, this);
    }
  }

  /**
   * It doesn't seem very sensible to have this operation, but it allows
   * implementers of the `ExpressionParent` interface (which quite a few
   * descending classes need to implement) to stop recursion.
   */
  get query(): Query {
    return (this);
  }

  get insert(): SyntaxTree.Insert {
    return (this._components.insert);
  }

  get select(): SyntaxTree.Select {
    return (this._components.select);
  }

  get update(): SyntaxTree.Update {
    return (this._components.update);
  }

  get delete(): SyntaxTree.Delete {
    return (this._components.delete);
  }

  get from(): SyntaxTree.From {
    return (this._components.from);
  }

  get where(): SyntaxTree.Where {
    return (this._components.where);
  }

  set where(toAdd) {
    if (toAdd != this._components.where) {
      this._components.where = toAdd;
      this.markSaveRequired();
    }
  }

  /**
   * @return All components of this query.
   */
  get allComponents(): SyntaxTree.Component[] {
    return (Object.values(this._components));
  }

  /**
   * @return True, if this query always returns a single row
   */
  get singleRow(): boolean {
    return (this._singleRow);
  }

  /**
   * @param value True, if this query always returns a single row
   */
  set singleRow(value: boolean) {
    this._singleRow = value;
    this.markSaveRequired();
  }

  /**
   * @return The schema definition of a table with the given name.
   */
  getTableSchema(name: string) {
    return (this.schema.getTable(name));
  }

  /**
   * @return All expressions that are leaves of the expression tree.
   */
  getLeaves(): SyntaxTree.Expression[] {
    const nestedLeaves = this.allComponents.map(c => c.getLeaves());
    return [].concat(...nestedLeaves);
  }

  /**
   * @return All parameters of this query.
   */
  get parameters(): SyntaxTree.ParameterExpression[] {
    return (this.getLeaves().filter(e => e instanceof SyntaxTree.ParameterExpression) as SyntaxTree.ParameterExpression[])
  }

  /**
   * @return Names of all parameters if this query.
   */
  get parameterNames(): string[] {
    return (this.parameters.map(p => p.key));
  }

  /**
   * @return True, if this query has any parameters.
   */
  get hasParameters(): boolean {
    return (this.parameters.length > 0);
  }

  /**
   * Retrieves the SQL representation of this query.
   *
   * @return An SQL string that represents this query.
   */
  toSqlString(): string {
    return (this.allComponents
      .map(c => c.toSqlString())
      .join('\n'));
  }

  /**
   * @return A validation report
   */
  validate(): ValidationResult {
    const ownErrors: ValidationError[] = [];

    // Ensure there is a WHERE condition if this query promises to
    // deliver a single row.
    if (this.singleRow && !this.where) {
      ownErrors.push(new ValidationErrors.UnplausibleSingleRow(true));
    }

    return (new ValidationResult(ownErrors, this.allComponents.map(c => c.validate(this.schema))));
  }

  /**
   * @return True, if this query is actually valid.
   */
  get isValid(): boolean {
    return (this.validate().isValid);
  }

  /**
   * @return The "over-the-wire" JSON representation
   */
  public toModel(): Model.QueryDescription {
    // Fill in basic information
    let toReturn: Model.QueryDescription = {
      name: this.name,
      id: this.id,
      apiVersion: this.apiVersion
    };

    // Fill in the optional singleRow annotation
    if (this.singleRow) {
      toReturn.singleRow = this.singleRow;
    }

    if (this.delete) {
      toReturn.delete = this.delete.toModel();
    }

    if (this.update) {
      toReturn.update = this.update.toModel();
    }

    if (this.insert) {
      toReturn.insert = this.insert.toModel();
    }

    if (this.select) {
      toReturn.select = this.select.toModel();
    }

    if (this.from) {
      toReturn.from = this.from.toModel();
    }

    if (this.where) {
      toReturn.where = this.where.toModel();
    }

    return (toReturn);
  }

  /**
   * Removes a componenty from this query by reference.
   */
  public removeChild(formerChild: SyntaxTree.Removable): void {
    Object.entries(this._components).forEach(e => {
      if (e[1] == formerChild) {
        (this._components as { [key: string]: SyntaxTree.Component })[e[0]] = undefined;
        this.markSaveRequired();
        return;
      }
    });
  }
}

/**
 * Describes the column of a result in detail.
 */
export interface ResultColumn {
  // The query this column is part of
  query: Query

  // The fully qualified name of this column. For columns of
  // tables this means there is a table prefix, for columns
  // that are actually an expression this is the string
  // representation of the expression.
  fullName: string

  // The shorthand-name of this column. If the column has an
  // alias this acts as the short name.
  shortName: string

  // The expression that results in this column. Careful: This
  // may be a StarExpression.
  expr: SyntaxTree.Expression
}

/**
 * Maps the given model to the correct type of query.
 *
 * @param toLoad The model to load
 *
 * @return A correct instance of a Query
 */
export function loadQuery(toLoad: Model.QueryDescription, schema: Schema, project: Project): Query {
  return (new Query(schema, toLoad));
}
