import { Component, Input, EventEmitter, Output, ViewChild, ElementRef } from "@angular/core";
import { FormControl, Validators, NgForm, AbstractControl } from '@angular/forms';


@Component({
  selector: 'validate-input',
  templateUrl: './templates/validate-input.html'
})
export class ValidateInputComponent {
  @Input() type: string;
  @Input() placeholder: string;
  @Input() error: string;
  @Input() value: string;
  @Input() icon: string;

  @Output() valueChange = new EventEmitter<string | number>();

  @ViewChild("inputRef", {static: false}) inputRef: ElementRef;

  public getErrorMessage(): string {
    return this.error || `Invalid ${this.placeholder}`
  }

  /**
   * Creates a font awesome class with a passed string
   * @retun font awesome class
   */
  public getIconClass(): string {
    return `fa ${this.icon}`
  }

  /** 
   * Returns the value of the input field
   * @return string or number depends on the type
  */
  public getValueOfInput(): string | number {
    return this.inputRef.nativeElement.value;
  }

  public isIconActive(): boolean {
    return this.icon !== undefined
  }

  public isInputValid(): boolean {
    return this.inputRef.nativeElement.checkValidity();
  }

  public emitInput(): void {
    if (this.isInputValid()) {
      this.valueChange.emit(this.getValueOfInput())
    }
  }
}