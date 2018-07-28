import { Component, OnInit, Input } from '@angular/core'

import { BlockLanguageDescription } from '../../shared/block/block-language.description'
import { ParameterDeclaration } from '../../shared/block/generator/parameters.description';


type FormalParameter = ParameterDeclaration & { name: string };

/**
 * Allows editing the actual parameters that are used during block language generation.
 */
@Component({
  templateUrl: 'templates/edit-actual-parameters.html',
  selector: 'edit-actual-parameters'
})
export class EditActualParameters {
  @Input() blockLanguage: BlockLanguageDescription;

  get hasFormalParameters() {
    return (!!(
      this.blockLanguage
      && this.blockLanguage.localGeneratorInstructions
      && this.blockLanguage.localGeneratorInstructions.parameterDeclarations
      && Object.keys(this.blockLanguage.localGeneratorInstructions.parameterDeclarations).length > 0
    ));
  }

  get formalParameters(): FormalParameter[] {
    const declarations = this.blockLanguage.localGeneratorInstructions.parameterDeclarations || {};
    return (Object.entries(declarations).map(([name, declaration]) => {
      return ({
        name: name,
        type: declaration.type,
        defaultValue: declaration.defaultValue,
      });
    }));
  }
}
