import { Component, Input } from '@angular/core';

import { JsonSchemaValidationService } from '../json-schema-validation.service'

import { GeneratorError } from '../../shared/block/generator/error.description'

@Component({
  templateUrl: 'templates/error-list.html',
  selector: 'error-list'
})
export class ErrorListComponent {
  @Input() public errors: GeneratorError[] = [];

  constructor(
    private _schemaValidation: JsonSchemaValidationService
  ) {
  }

  errorMessage(err: GeneratorError) {
    switch (err.type) {
      case "ParameterMissingValue":
        return (`Parameter "${err.name}" muss angegeben werden`);
      default:
        return (JSON.stringify(err));
    }
  }
}
