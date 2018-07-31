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
    } else {
      const schema = context.additional.databaseSchema;

      // There should obviously only be a single `FROM`, but because there may be
      // as well no `FROM` at all we simply roll with whatever bizarre structure
      // we need to validate.
      const allFroms = ast.getNodesOfType({ languageName: "sql", typeName: "from" });
      allFroms.forEach(from => {
        const takenNames = new Set<string>();

        const allIntroduced = from.getNodesOfType({ languageName: "sql", typeName: "tableIntroduction" });
        allIntroduced.forEach(introduced => {
          const introducedTableName = introduced.properties["name"];

          // Does that table exist in our schema?
          if (!schema.hasTable(introducedTableName)) {
            context.addError("UNKNOWN_TABLE", introduced)
          }

          // Is that name already taken?
          if (takenNames.has(introducedTableName)) {
            context.addError("DUPLICATE_TABLE_NAME", introduced);
          } else {
            takenNames.add(introducedTableName);
          }
        });
      });
    }
  }
}
