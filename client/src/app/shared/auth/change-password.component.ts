import { UserService } from './user.service';
import { ChangePasswordDescription } from './auth-description';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Component } from '@angular/core';

@Component({
  selector: "change-password",
  templateUrl: "./templates/change-password.html"
})
export class ChangePasswordComponent {
  constructor(
    private _dialogRef: MatDialogRef<ChangePasswordComponent>,
    private _userService: UserService
  ) {}

  public newPasswordData: ChangePasswordDescription = { 
    currentPassword: undefined,
    newPassword: undefined,
    confirmedPassword: undefined,
  };

  public onChangePassword(): void {
    this._userService.onChangePassword$(this.newPasswordData).subscribe(
      _ => console.log("changed")
    )
  }

  public static showDialog(dialog: MatDialog): void {
    dialog.open(ChangePasswordComponent, {
      height: "400px"
    })
  }
}