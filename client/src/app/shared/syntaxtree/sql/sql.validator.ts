import { SpecializedValidator } from "../validator";
import {
  ValidationContext,
  ErrorCodes,
  ErrorMissingChild,
} from "../validation-result";
import * as AST from "../syntaxtree";
import { OccursDescription } from "../occurs.description";

import { Schema } from "../../schema/schema";
import { isInOccurs } from "../occurs";

/**
 * SQL validation requires a schema as additional context.
 */
export interface DatabaseSchemaAdditionalContext {
  databaseSchema: Schema;
  validateGroupBy?: boolean;
}

export function isDatabaseSchemaAdditionalContext(
  obj: any
): obj is DatabaseSchemaAdditionalContext {
  return typeof obj === "object" && obj.databaseSchema instanceof Schema;
}

// These functions are aggregation functions
// Based on: https://sqlite.org/lang_aggfunc.html
const FUNCTION_AGGREGATION = new Set([
  "min",
  "max",
  "count",
  "avg",
  "sum",
  "group_concat",
]);

// These are the required argument counts for various accounts
// Based on: https://sqlite.org/lang_aggfunc.html
const FUNCTION_ARGUMENT_COUNT: Readonly<{
  [key: string]: OccursDescription;
}> = Object.freeze({
  avg: "1",
  count: "*",
  group_concat: { minOccurs: 1, maxOccurs: 2 },
  min: "1",
  max: "1",
  total: "1",
  sum: "1",
});

/**
 * Extended validation for SQL. Mainly checks the tables and columns
 * mentioned in the syntaxtree against the names that are introduced
 * in the `FROM` component.
 */
export class SqlValidator extends SpecializedValidator {
  validateFromRoot(ast: AST.Node, context: ValidationContext) {
    // Most in depth checks require a schema
    if (isDatabaseSchemaAdditionalContext(context.additional)) {
      const schema = context.additional.databaseSchema;
      this.validateNamesAgainstSchema(ast, schema, context);
    }

    // But some basic checks can be made without
    this.validateReferenceNamesExistingAndUnique(ast, context);

    // Validating "GROUP BY" is optional, because its a heuristic
    if (context.additional.validateGroupBy) {
      this.validateAggregationGroupBy(ast, context);
    }

    // Very basic type checks for function arguments
    this.validateNumberOfArguments(ast, context);
  }

  /**
   * Checks all occuring names. Specifically ensures that
   * - All mentioned tables exist
   * - All columns only mention existing columns on existing tables
   */
  private validateNamesAgainstSchema(
    ast: AST.Node,
    schema: Schema,
    context: ValidationContext
  ) {
    // There should obviously only be a single `FROM`, but because there may be
    // as well no `FROM` at all we simply roll with whatever bizarre structure
    // we need to validate.
    const allFroms = ast.getNodesOfType({
      languageName: "sql",
      typeName: "from",
    });
    allFroms.forEach((from) => {
      const allIntroduced = from.getNodesOfType({
        languageName: "sql",
        typeName: "tableIntroduction",
      });
      allIntroduced.forEach((introduced) => {
        const introducedTableName = introduced.properties["name"];

        // Does that table exist in our schema?
        if (!schema.hasTable(introducedTableName)) {
          context.addError("UNKNOWN_TABLE", introduced);
        }
      });
    });

    // Ensure that every mentioned column is valid, no matter where it appears
    const allColumns = ast.getNodesOfType({
      languageName: "sql",
      typeName: "columnName",
    });
    allColumns.forEach((column) => {
      const referencedTable = column.properties["refTableName"];
      const columnName = column.properties["columnName"];
      if (!schema.hasColumn(referencedTable, columnName)) {
        context.addError("UNKNOWN_COLUMN", column);
      }
    });
  }

  private validateReferenceNamesExistingAndUnique(
    ast: AST.Node,
    context: ValidationContext
  ) {
    // Collects all names that seem to be available
    const fromAvailableNames = new Set<string>();

    // There should obviously only be a single `FROM`, but because there may be
    // as well no `FROM` at all we simply roll with whatever bizarre structure
    // we need to validate.
    const allFroms = ast.getNodesOfType({
      languageName: "sql",
      typeName: "from",
    });
    allFroms.forEach((from) => {
      const takenNames = new Set<string>();

      const allIntroduced = from.getNodesOfType({
        languageName: "sql",
        typeName: "tableIntroduction",
      });
      allIntroduced.forEach((introduced) => {
        const introducedTableName = introduced.properties["name"];

        // This name counts as available from now on
        fromAvailableNames.add(introducedTableName);

        // Is that name already taken?
        if (takenNames.has(introducedTableName)) {
          context.addError("DUPLICATE_TABLE_NAME", introduced);
        } else {
          takenNames.add(introducedTableName);
        }
      });
    });

    // Ensure that every mentioned column only uses mentioned tables
    const allColumns = ast.getNodesOfType({
      languageName: "sql",
      typeName: "columnName",
    });
    allColumns.forEach((column) => {
      const referencedTable = column.properties["refTableName"];
      if (!fromAvailableNames.has(referencedTable)) {
        context.addError("TABLE_NOT_IN_FROM", column);
      }
    });
  }

  /**
   * Attempts to guess whether an aggregation function is used meaningfully.
   */
  private validateAggregationGroupBy(
    ast: AST.Node,
    context: ValidationContext
  ) {
    // Are there any calls to aggregation functions without GROUP BY?
    const allFunctions = ast.getNodesOfType({
      languageName: "sql",
      typeName: "functionCall",
    });

    const aggregationFuncs = allFunctions.filter((f) => {
      const functionName = (f.properties || {})["name"] || "";
      return FUNCTION_AGGREGATION.has(functionName.toLowerCase());
    });
    const hasGroupBy =
      ast.getNodesOfType({ languageName: "sql", typeName: "groupBy" }).length >
      0;

    if (aggregationFuncs.length > 0 && !hasGroupBy) {
      aggregationFuncs.forEach((a) => {
        context.addError("AGGREGATION_WITHOUT_GROUP_BY", a);
      });
    }
  }

  private validateNumberOfArguments(ast: AST.Node, context: ValidationContext) {
    ast
      .getNodesOfType({ languageName: "sql", typeName: "functionCall" })
      .forEach((callNode) => {
        const funcName = callNode.properties["name"].toLocaleLowerCase();
        const numParameters = callNode.getChildrenInCategory("arguments")
          .length;

        const validNumParameters = FUNCTION_ARGUMENT_COUNT[funcName];
        if (
          validNumParameters &&
          !isInOccurs(numParameters, validNumParameters)
        ) {
          let errData: ErrorMissingChild = {
            category: "arguments",
            expected: { languageName: "sql", typeName: "expression" },
            index: numParameters,
          };
          context.addError(ErrorCodes.MissingChild, callNode, errData);
        }
      });
  }
}
