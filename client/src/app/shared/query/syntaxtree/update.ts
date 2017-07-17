import * as Model from '../description'
import { Query } from '../base'

import { Assign } from './assign'

export class Update extends Assign {
  constructor(model: Model.Update,
    query: Query) {
    super(model, query);
  }

  toSqlString(): string {
    const values = this.assignments
      .map(a => `${a.columnName} = ${a.expr.toSqlString()}`)
      .join(", ");

    let toReturn = `UPDATE ${this.tableName}\nSET ${values}`;

    return (toReturn);
  }
}
