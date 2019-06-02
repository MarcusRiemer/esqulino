import { Component, Output, EventEmitter } from "@angular/core";
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { AuthContentDescription } from './auth-description';

@Component({
  selector: 'sign-in',
  templateUrl: './templates/sign-in.html'
})
export class SignInComponent {
  @Output() content = new EventEmitter<AuthContentDescription>()

  constructor() {}

  register: boolean = false;

  public onResetPassword(): void {
    this.content.emit('ResetPassword');
  }
}