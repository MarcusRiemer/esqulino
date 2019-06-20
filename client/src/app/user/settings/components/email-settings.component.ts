import { Component } from '@angular/core';

import { UserService } from '../../../shared/auth/user.service';
import { ChangePrimaryEmailDescription, ServerProviderDescription } from '../../../shared/auth/provider.description';
import { UserEmailDescription } from '../../../shared/auth/user.description';

@Component({
  templateUrl: '../templates/email-settings.html'
})
export class EmailSettingsComponent {
  private identities$ = this._userService.identities$;

  constructor(
    private _userService: UserService
  ) {
    this.identities$.value.subscribe(
      identities => {
        this.identities = identities;
        this.primaryEmailData.primaryEmail = identities.primary;
      }
    )
  }

  public primaryEmailData: ChangePrimaryEmailDescription = {
    primaryEmail: "Please add an e-mail to your account"
  };

  public identities: ServerProviderDescription;
  public newEmailData: UserEmailDescription = {
    email: undefined
  }

  public isSelectedEmailCurrentPrimary(): boolean {
    return this.identities.primary === this.primaryEmailData.primaryEmail;
  }

  public isInIntern(searchFor: string): boolean {
    return this.identities.intern.some(v => v.uid === searchFor)
  }

  public isInternEmpty(): boolean {
    return this.identities.intern.length === 0
  }

  public onAddEmail() {
    if (!this.isInIntern(this.newEmailData.email)) {
      if (this.newEmailData.email) {
        this._userService.addEmail$(this.newEmailData).subscribe()
      } else alert("Diese E-Mail kann nicht hinzugefügt werden")
    } else alert("Diese E-Mail ist bereits an deinen Account gebunden!")
  }

  public onDeleteEmail(uid: string): void {
    if (uid !== this.primaryEmailData.primaryEmail) {
      if (this.identities.intern.length > 1) {
        this._userService.deleteEmail$(uid).subscribe();
      } else alert("Es muss eine E-Mail vorhanden bleiben.")
    } else alert("Wähle zuvor eine andere primäre E-mail aus!")
  }

  public onChangePrimaryEmail(): void {
    console.log(this.identities.intern)
    if (!this.isSelectedEmailCurrentPrimary()) {
      if (this.isInIntern(this.primaryEmailData.primaryEmail)) {
        this._userService.changePrimaryEmail$(this.primaryEmailData)
          .subscribe()

      } else alert("Diese E-Mail wurde noch nicht deinem Konto hinzugefügt")
    }
  }
}