import { Component, Input, EventEmitter, Output, ElementRef, HostListener, ContentChild } from "@angular/core";


@Component({
  selector: 'validate-input',
  templateUrl: './templates/validate-input.html'
})
export class ValidateInputComponent {
  @Input() error: string;
  @Input() value: string;
  @Input() icon: string;

  @Output() valueChange = new EventEmitter<string | number>();

  @ContentChild("inputRef", {static: false}) inputRef: ElementRef;

  @HostListener('change') onChange() {
    this.emitInput()
  }

  public getErrorMessage(): string {
    return this.error
  }

  /**
   * Creates a font awesome class with a passed string
   * @retun font awesome class
   */
  public getIconClass(): string {
    return `fa fa-${this.icon}`
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