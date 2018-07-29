import { Component, OnChanges, Input, SimpleChanges } from '@angular/core'

import { BlockLanguageDescription } from '../../shared/block/block-language.description'
import { ParameterDeclaration } from '../../shared/block/generator/parameters.description';

/**
 * Allows editing the actual parameters that are used during block language generation.
 */
@Component({
  templateUrl: 'templates/edit-actual-parameters.html',
  selector: 'edit-actual-parameters'
})
export class EditActualParameters implements OnChanges {
  @Input() blockLanguage: BlockLanguageDescription;

  public formalParameterNames: string[] = [];

  get hasFormalParameters() {
    return (!!(
      this.blockLanguage
      && this.blockLanguage.localGeneratorInstructions
      && this.blockLanguage.localGeneratorInstructions.parameterDeclarations
      && Object.keys(this.blockLanguage.localGeneratorInstructions.parameterDeclarations).length > 0
    ));
  }

  ngOnChanges(changes: SimpleChanges) {
    const cbl = changes.blockLanguage;
    if (cbl) {
      const newBlockLanguage: BlockLanguageDescription = cbl.currentValue;
      const declarations = newBlockLanguage.localGeneratorInstructions.parameterDeclarations || {};
      this.formalParameterNames = Object.keys(declarations);
    }
  }
}
