import { Component, Inject, Optional, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { UserService } from "./../../../shared/auth/user.service";
import { UserAddEmailDescription } from "./../../../shared/auth/user.description";
import {
  ServerProviderDescription,
  ProviderDescription,
} from "./../../../shared/auth/provider.description";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";
@Component({
  templateUrl: "./templates/add-email-dialog.html",
})
export class AddEmailDialogComponent implements OnInit {
  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: Observable<ServerProviderDescription>,
    private dialogRef: MatDialogRef<AddEmailDialogComponent>,
    private _userService: UserService
  ) {}

  public identities: ServerProviderDescription;
  public passwordConfirmation: string;
  public newEmailData: UserAddEmailDescription = {
    email: undefined,
    password: undefined,
  };

  ngOnInit(): void {
    this._userService.identities
      .pipe(first())
      .subscribe((v) => (this.identities = v));
  }

  /**
   * Triggers the addition of a new password identity
   */
  public onAddEmail(): void {
    if (this.newEmailData.password) {
      if (this.passwordConfirmation === this.newEmailData.password) {
        this._userService
          .addEmail$(this.newEmailData)
          .subscribe((_) => this.dialogRef.close());
      } else alert("Deine Passwörter stimmen nicht über ein!");
    } else alert("Bitte wähle ein Passwort.");
  }

  /**
   * Is a password identity linked to the current user
   */
  public existsPasswordIdentity(identities: ProviderDescription[]): boolean {
    return identities.some((v) => v.type == "PasswordIdentity");
  }
}
