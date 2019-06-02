import { Component, Input, EventEmitter, Output } from "@angular/core";
import { FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'auth-input',
  templateUrl: './templates/auth-input.html'
})
export class AuthInputComponent {
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

  public getErrorMessage(): string {
    return this.error || `Invalid ${this.placeholder}`
  }

  public getControl(): FormControl {
    switch (this.controlName) {
      case 'email': return this.email
      case 'password': return this.password
      case 'username': return this.password
    }
    alert("Error: wrong controlName");
  }

  public emitInput(): void {
    if (this.getControl().valid) {
      this.valueChange.emit(this.getControl().value)
    }
  }
}