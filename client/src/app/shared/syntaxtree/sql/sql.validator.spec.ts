import { SqlValidator, DatabaseSchemaAdditionalContext } from './sql.validator'

import { ValidationContext } from '../validation-result'

import { SPEC_TABLES } from '../../schema/schema.spec'
import { Schema } from '../../schema/schema'

function specContext(schemaDescription = SPEC_TABLES): DatabaseSchemaAdditionalContext {
  return ({
    databaseSchema: new Schema(schemaDescription)
  });
}

describe(`Specialized SQL Validator`, () => {
  it(`tmp`, () => {
    const context = specContext();
    const sqlValidator = new SqlValidator();
  });
});
