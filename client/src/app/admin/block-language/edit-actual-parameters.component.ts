import { Component, OnChanges, Input, SimpleChanges } from "@angular/core";

import { BlockLanguageDescription } from "../../shared/block/block-language.description";

/**
 * Allows editing the actual parameters that are used during block language generation.
 */
@Component({
  templateUrl: "templates/edit-actual-parameters.html",
  selector: "edit-actual-parameters",
})
export class EditActualParametersComponent implements OnChanges {
  @Input() blockLanguage: BlockLanguageDescription;

  public formalParameterNames: string[] = [];

  public maximumParamNameLength = 12;

  get hasFormalParameters() {
    return !!(
      this.blockLanguage &&
      this.blockLanguage.localGeneratorInstructions &&
      this.blockLanguage.localGeneratorInstructions.parameterDeclarations &&
      Object.keys(
        this.blockLanguage.localGeneratorInstructions.parameterDeclarations
      ).length > 0
    );
  }

  /**
   * React to changes in the given block language.
   */
  ngOnChanges(changes: SimpleChanges) {
    const cbl = changes.blockLanguage;
    if (
      cbl &&
      cbl.currentValue &&
      cbl.currentValue.localGeneratorInstructions
    ) {
      const newBlockLanguage: BlockLanguageDescription = cbl.currentValue;
      const declarations =
        newBlockLanguage.localGeneratorInstructions.parameterDeclarations || {};
      this.formalParameterNames = Object.keys(declarations);
      this.maximumParamNameLength = Math.max(
        ...this.formalParameterNames.map((s) => s.length)
      );
    }
  }
}
