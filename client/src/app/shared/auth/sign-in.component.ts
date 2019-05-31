import { Component, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthContentDescription } from './auth-dialog-content.description';

@Component({
  selector: 'sign-in',
  templateUrl: './templates/sign-in.html'
})
export class SignInComponent {
  @Output() content = new EventEmitter<AuthContentDescription>()

  constructor() {}

  register: boolean = false;

  public general = new FormGroup({
    email: new FormControl('', [
      Validators.email, Validators.required
    ]),
    password: new FormControl('', [
      Validators.minLength(6), Validators.required
    ])
  })

  public onResetPassword(): void {
    this.content.emit('ResetPassword');
  }
}