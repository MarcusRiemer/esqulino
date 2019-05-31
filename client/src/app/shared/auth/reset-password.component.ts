import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'reset-password',
  templateUrl: './templates/reset-password.html'
})
export class ResetPasswordComponent {
  public email: string;
}