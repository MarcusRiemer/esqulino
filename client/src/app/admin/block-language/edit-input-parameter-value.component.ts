import { Component, Input, Output, EventEmitter } from "@angular/core";

import { BlockLanguageDescription } from "../../shared/block/block-language.description";

import { EditBlockLanguageService } from "./edit-block-language.service";

/**
 * Used to synchronize changes to the edited block language
 */
@Component({
  templateUrl: "templates/edit-input-parameter-value.html",
  selector: "edit-input-parameter-value",
})
export class EditInputParameterValueComponent {
  /**
   * The name of the parameter whose values is going to be edited
   */
  @Input() public name: string;

  /**
   * The block language the parameter is part of.
   */
  @Input() public blockLanguage: BlockLanguageDescription;

  /**
   * The width to use for the parameter name display
   */
  @Input() public labelWidth: number = 10;

  /**
   * Emitted if the value provided by the user has changed
   */
  @Output() currentValueChange = new EventEmitter<string>();

  constructor(private _editedBlockLanguage: EditBlockLanguageService) {}

  /**
   * The declaration for the parameter tha is currently being edited.
   */
  private get declaration() {
    return this.blockLanguage.localGeneratorInstructions.parameterDeclarations[
      this.name
    ];
  }

  /**
   * All values  that are assigned
   */
  private get assignedValues() {
    return this.blockLanguage.localGeneratorInstructions.parameterValues;
  }

  /**
   * The type the edited value must satisfy
   */
  get type() {
    return this.declaration.type;
  }

  get inputType() {
    switch (this.type.type) {
      case "color":
        return "color";
      default:
        return "text";
    }
  }

  /**
   * The default value to use if no user generated value is present.
   */
  get defaultValue() {
    return this.declaration.defaultValue;
  }

  /**
   * The value that should be shown to the user. Defaults to the placeholder
   * if no meaningful input has taken place.
   */
  get currentValue() {
    if (
      this.edited &&
      this.assignedValues &&
      this.name in this.assignedValues
    ) {
      return this.assignedValues[this.name].toString();
    } else {
      return (this.defaultValue || "").toString();
    }
  }

  /**
   * Updating the value for this parameter on the block language.
   */
  set currentValue(newValue: string) {
    this._editedBlockLanguage.doUpdate((bl) => {
      if (!bl.localGeneratorInstructions.parameterValues) {
        bl.localGeneratorInstructions.parameterValues = {};
      }

      bl.localGeneratorInstructions.parameterValues[this.name] = newValue;
    });

    // Inform surroundings about the change
    this.currentValueChange.emit(newValue);
  }

  /**
   * @return True, if this value is explicitly set.
   */
  get edited() {
    return this.assignedValues && this.name in this.assignedValues;
  }

  /**
   * The user has decided whether he wants to edit this particular value
   */
  set edited(newValue: boolean) {
    // Is there a default value that needs to be set?
    if (newValue && !this.edited) {
      this.currentValue = this.defaultValue.toString();
    }
    // Is there a current value that needs to be removed?
    else if (!newValue && this.edited) {
      this._editedBlockLanguage.doUpdate((bl) => {
        delete bl.localGeneratorInstructions.parameterValues[this.name];
      });

      // Inform surroundings about the change
      this.currentValueChange.emit(undefined);
    }
  }
}
