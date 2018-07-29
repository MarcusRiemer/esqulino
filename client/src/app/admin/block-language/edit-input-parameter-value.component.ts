import { Component, OnInit, Input } from '@angular/core'

import { BlockLanguageDescription } from '../../shared/block/block-language.description'
import { ParameterDeclaration } from '../../shared/block/generator/parameters.description'

/**
 * Used to synchronize changes to the edited block language
 */
@Component({
  templateUrl: 'templates/edit-input-parameter-value.html',
  selector: 'edit-input-parameter-value'
})
export class EditInputParameterValueComponent implements OnInit {
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

  private _currentValue: string = "";

  ngOnInit() {
    // Restoring a previously assigned value
    if (this.edited && this.assignedValues && this.name in this.assignedValues) {
      this._currentValue = this.assignedValues[this.name].toString();
    }
  }

  /**
   * The declaration for the parameter tha is currently being edited.
   */
  private get declaration() {
    return (this.blockLanguage.localGeneratorInstructions.parameterDeclarations[this.name]);
  }

  /**
   * All values  that are assigned
   */
  private get assignedValues() {
    return (this.blockLanguage.localGeneratorInstructions.parameterValues);
  }

  /**
   * The type the edited value must satisfy
   */
  get type() {
    return (this.declaration.type);
  }

  get inputType() {
    switch (this.type.type) {
      case "color":
        return ("color");
      default:
        return ("text");
    }
  }

  /**
   * The default value to use if no user generated value is present.
   */
  get defaultValue() {
    return (this.declaration.defaultValue);
  }


  /**
   * The value that should be shown to the user. Defaults to the placeholder
   * if no meaningful input has taken place.
   */
  get currentValue() {
    return (
      this.edited && this._currentValue.length > 0
        ? this._currentValue
        : this.defaultValue.toString()
    );
  }

  /**
   * Updating the value for this parameter on the block language.
   */
  set currentValue(newValue: string) {
    this._currentValue = newValue;
    this.ensureAssignedValues();
    this.assignedValues[this.name] = newValue;
  }

  /**
   * @return True, if this value is explicitly set.
   */
  get edited() {
    return (this.assignedValues && this.name in this.assignedValues);
  }

  /**
   * The user has decided whether he wants to edit this particular value
   */
  set edited(newValue: boolean) {
    // Is there a default value that needs to be set?
    if (newValue && !this.edited) {
      // Assign the last value we had for this parameter
      this.ensureAssignedValues();
      this.assignedValues[this.name] = this._currentValue;
      console.log(`"edited" introduced`);
    }
    // Is there a current value that needs to be removed?
    else if (!newValue && this.edited) {
      delete this.assignedValues[this.name];
      console.log(`"edited" removed`);
    }
  }

  /**
   * Generates assigned values if they haven't been generated so far
   */
  private ensureAssignedValues() {
    if (!this.assignedValues) {
      this.blockLanguage.localGeneratorInstructions.parameterValues = {};
    }
  }
}
