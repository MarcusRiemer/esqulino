import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';

import { UserService } from '../../../shared/auth/user.service';
import { ChangePrimaryEmailDescription, ServerProviderDescription } from '../../../shared/auth/provider.description';
import { UserEmailDescription } from '../../../shared/auth/user.description';
import { AddEmailDialogComponent } from './add-email-dialog.component';

@Component({
  templateUrl: '../templates/email-settings.html'
})
export class EmailSettingsComponent {
  private identities$ = this._userService.identities$;

  constructor(
    private _userService: UserService,
    private _dialog: MatDialog
  ) {
    this.identities$.value.subscribe(
      identities => {
        this.identities = identities;
        this.primaryEmailData.primaryEmail = identities.primary;
        this.identities.providers.forEach(v => {
          if (v.data.email)
            this.emails.add(v.data.email)
        })
      }
    )
  }

  public primaryEmailData: ChangePrimaryEmailDescription = {
    primaryEmail: "Please add an e-mail to your account"
  };
  //All distinct e-mails from all providers  
  public emails: Set<string> = new Set();
  public identities: ServerProviderDescription;
  public newEmailData: UserEmailDescription = {
    email: undefined,
  }

  public isSelectedEmailCurrentPrimary(): boolean {
    return this.identities.primary === this.primaryEmailData.primaryEmail;
  }

  public existsOnePasswordIdentity(): boolean {
    return this.identities.providers.some(v => v.type == "Blattwerkzeug")
  }

  public existingEmail(): boolean {
    return this.identities.providers.some(v =>
      v.type == "Blattwerkzeug" && v.data.email == this.newEmailData.email
    )
  }

  /**
   * Adds a new e-mail to the signed in user.
   * Checks if the new mail is not already linked with this account and
   * the value is different to undefined. 
   */
  public onAddEmail() {
    if (!this.existingEmail()) {
      if (this.newEmailData.email) {
        if (this.existsOnePasswordIdentity()) {
          this._userService.addEmail$(this.newEmailData).subscribe()
        } else {
          // If there exists no identity with password, ask for password
          this._dialog.open(AddEmailDialogComponent, {
            height: '240px',
            minWidth: '20em',
            data: this.newEmailData
          });
        }
      } else alert("Diese E-Mail kann nicht hinzugefügt werden")
    } else alert("Diese E-Mail ist bereits an deinen Account gebunden!")
  }

  public onChangePrimaryEmail(): void {
    if (!this.isSelectedEmailCurrentPrimary()) {
      if (this.emails.has(this.primaryEmailData.primaryEmail)) {
        this._userService.sendChangePrimaryEmail$(this.primaryEmailData)
          .subscribe()

      } else alert("Diese E-Mail wurde noch nicht deinem Konto hinzugefügt")
    }
  }
}