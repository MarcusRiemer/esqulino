import { SpecializedValidator } from '../validator'
import { ValidationContext } from '../validation-result'
import * as AST from '../syntaxtree'

import { Schema } from '../../schema/schema'

/**
 * SQL validation requires a schema as additional context.
 */
export interface DatabaseSchemaAdditionalContext {
  databaseSchema: Schema
}

export function isDatabaseSchemaAdditionalContext(obj: any): obj is DatabaseSchemaAdditionalContext {
  return (typeof obj === "object" && obj.databaseSchema instanceof Schema);
}

/**
 * Extended validation for SQL. Mainly checks the tables and columns
 * mentioned in the syntaxtree against the names that are introduced
 * in the `FROM` component.
 */
export class SqlValidator extends SpecializedValidator {

  validateFromRoot(ast: AST.Node, context: ValidationContext) {
    if (!isDatabaseSchemaAdditionalContext(context.additional)) {
      context.addError("NO_DATABASE_SCHEMA", ast);
    }
  }
}
