import { Component } from '@angular/core';

import { AuthDialogComponent } from './auth-dialog.component';

@Component({
  selector: 'authentication-button',
  templateUrl: './templates/login-button.html'
})
export class LoginButtonComponent{
  constructor() {}
  public openDialog(): void {}
}