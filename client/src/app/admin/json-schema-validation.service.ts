import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import * as Ajv from "ajv";
import { ServerApiService } from "../shared";
import { GeneratorError } from "../shared/block/generator/error.description";

//! These names describe valid schemas
type SchemaName = "BlockLanguageGeneratorDocument";

// TODO: Get hold of that meta-schema in a nicer way
declare const require: any;

/**
 * Provides schema validation on the client.
 */
@Injectable()
export class JsonSchemaValidationService {
  // This ajv-instance caches the required schemas
  private readonly _ajv = new Ajv({ allErrors: true }).addMetaSchema(
    require("ajv/lib/refs/json-schema-draft-06.json")
  );

  constructor(
    private _serverApi: ServerApiService,
    private _http: HttpClient
  ) {}

  /**
   * Retrieves a validator for a specific schema. If the requested validator
   * is not available it is fetched from the server.
   */
  private async getValidator(name: SchemaName) {
    let toReturn = this._ajv.getSchema(name);

    if (!toReturn) {
      const schema = await this._http
        .get(this._serverApi.individualJsonSchemaUrl(name))
        .toPromise();
      this._ajv.addSchema(schema, name);

      toReturn = this._ajv.getSchema(name);
    }

    return toReturn;
  }

  /**
   * Validates the given object against the given schema.
   */
  public async validate(
    schemaName: SchemaName,
    obj: any
  ): Promise<GeneratorError[]> {
    const validator = await this.getValidator(schemaName);
    const result = await validator(obj);

    if (result) {
      return [];
    } else {
      console.log(validator.errors);
      console.log(this._ajv.errorsText(validator.errors));
      return validator.errors.map(
        (e): GeneratorError => {
          return {
            type: "InvalidInstructions",
            error: e,
          };
        }
      );
    }
  }
}
