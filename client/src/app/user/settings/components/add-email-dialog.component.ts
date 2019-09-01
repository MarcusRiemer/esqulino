import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";

import { UserService } from "./../../../shared/auth/user.service";
import { UserAddEmailDescription } from "./../../../shared/auth/user.description";
import { ServerProviderDescription } from "./../../../shared/auth/provider.description";
@Component({
  templateUrl: "./templates/add-email-dialog.html"
})
export class AddEmailDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ServerProviderDescription,
    private dialogRef: MatDialogRef<AddEmailDialogComponent>,
    private _userService: UserService
  ) {}

  // Passed linked indentities
  private identities = this.data;

  public passwordConfirmation: string;
  public newEmailData: UserAddEmailDescription = {
    email: undefined,
    password: undefined
  };

  /**
   * Triggers the addition of a new password identity
   */
  public onAddEmail(): void {
    if (this.newEmailData.password) {
      if (this.passwordConfirmation === this.newEmailData.password) {
        this._userService
          .addEmail$(this.newEmailData)
          .subscribe(_ => this.dialogRef.close());
      } else alert("Deine Passwörter stimmen nicht über ein!");
    } else alert("Bitte wähle ein Passwort.");
  }

  /**
   * Is a password identity linked to the current user
   */
  public existsPasswordIdentity(): boolean {
    return this.identities.providers.some(v => v.type == "PasswordIdentity");
  }
}
