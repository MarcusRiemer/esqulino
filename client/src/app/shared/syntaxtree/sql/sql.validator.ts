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

      // Collects all names that seem to be available
      const fromAvailableNames = new Set<string>();

      // There should obviously only be a single `FROM`, but because there may be
      // as well no `FROM` at all we simply roll with whatever bizarre structure
      // we need to validate.
      const allFroms = ast.getNodesOfType({ languageName: "sql", typeName: "from" });
      allFroms.forEach(from => {
        const takenNames = new Set<string>();

        const allIntroduced = from.getNodesOfType({ languageName: "sql", typeName: "tableIntroduction" });
        allIntroduced.forEach(introduced => {
          const introducedTableName = introduced.properties["name"];

          // This name counts as available from now on
          fromAvailableNames.add(introducedTableName);

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

      const allSelects = ast.getNodesOfType({ languageName: "sql", typeName: "select" });
      allSelects.forEach(select => {
        const columns = select.getChildrenInCategory("columns");

        if (columns.length === 0) {
          context.addError("EMPTY_SELECT", select);
        }

        columns.forEach(column => {
          const referencedTable = column.properties["refTableName"];
          const columnName = column.properties["columnName"];
          if (!fromAvailableNames.has(referencedTable)) {
            context.addError("TABLE_NOT_IN_FROM", column);
          } else {
            if (!schema.hasColumn(referencedTable, columnName)) {
              context.addError("UNKNOWN_COLUMN", column);
            }
          }
        });
      });
    }
  }
}
