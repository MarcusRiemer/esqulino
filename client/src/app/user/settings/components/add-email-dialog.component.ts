import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';


import { UserService } from './../../../shared/auth/user.service';
import { UserEmailDescription, UserAddEmailDescription } from './../../../shared/auth/user.description';

@Component({
  templateUrl: '../templates/add-email-dialog.html'
})
export class AddEmailDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UserEmailDescription,
    private dialogRef: MatDialogRef<AddEmailDialogComponent>,
    private _userService: UserService
  ) {}
  
  public passwordConfirmation: string;

  public newEmailData: UserAddEmailDescription = {
    email: this.data.email,
    password: undefined,
  } 

  public onAddEmail(): void {
    if (this.newEmailData.password) {
      if (this.passwordConfirmation === this.newEmailData.password){
        this._userService.addEmail$(this.newEmailData)
          .subscribe( _ => this.dialogRef.close())

      } else alert("Deine Passwörter stimmen nicht über ein!")
    } else alert("Bitte wähle ein Passwort.")
   
  }
}