import { Component, Input, EventEmitter, Output } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'validate-input',
  templateUrl: './templates/validate-input.html'
})
export class ValidateInputComponent {
  @Input() type: string;
  @Input() placeholder: string;
  @Input() controlName: string;
  @Input() error: string;
  @Input() value: string;

  @Output() valueChange = new EventEmitter<string>();

  public email = new FormControl('', [
    Validators.email, Validators.required
  ])

  public password = new FormControl('', [
    Validators.minLength(5), Validators.required
  ])

  public username = new FormControl('', [
    Validators.minLength(3), Validators.required
  ])

  public require = new FormControl('', [
    Validators.required
  ])

  public getErrorMessage(): string {
    return this.error || `Invalid ${this.placeholder}`
  }

  public getControl(): FormControl {
    // If theres no existing controlName
    this.controlName = this.controlName || this.type

    switch (this.controlName) {
      case 'email': return this.email
      case 'password': return this.password
      case 'username': return this.username
      case 'require': return this.require;
      default: throw Error('wrong controlName');
    }
  }

  public emitInput(): void {
    if (this.getControl().valid) {
      this.valueChange.emit(this.getControl().value)
    }
  }
}