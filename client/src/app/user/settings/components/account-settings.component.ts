import { Component } from '@angular/core';

import { UserService } from '../../../shared/auth/user.service';
import { providers } from '../../../shared/auth/providers';
import { UserNameDescription } from './../../../shared/auth/user.description';
import { ProviderDescription, ServerProviderDescription } from '../../../shared/auth/provider.description';

@Component({
  templateUrl: '../templates/account-settings.html'
})
export class AccountSettingsComponent {
  constructor(
    private _userService: UserService,
  ) {
    this._userService.identities$.value.subscribe(
      identities => this.identities = identities
    )
  }

  public username$ = this._userService.userDisplayName$;

  public providers = providers;
  public identities: ServerProviderDescription;

  public userNameData: UserNameDescription = {
    displayName: undefined,
  };

  private anotherProviderWithSameEmail(identity: ProviderDescription): boolean {
    return this.identities.providers.some(v =>
      v.email === identity.email && v.type !== identity.type
    )
  }

  public onDeleteIdentity(identity: ProviderDescription, primary: string): void {
    // If current providers mail is different to the current primary mail
    // or there existing an another provider with the same mail as the primary,
    // delete the clicked identity
    if (
      identity.email !== primary
      || this.anotherProviderWithSameEmail(identity) && identity.email === primary
    ) {
      console.log(identity)
      console.log(this.anotherProviderWithSameEmail(identity) && identity.email === primary)
      if (this.identities.providers.length > 1) {
        this._userService.deleteEmail$(identity.id).subscribe();
      } else alert("Es muss eine E-Mail vorhanden bleiben.")
    } else alert("Wähle zuvor eine andere primäre E-mail aus!")
  }

  public onChangeUserName(): void {
    if (this.userNameData.displayName) {
      this._userService.changeUserName$(this.userNameData)
        .subscribe()
    }
  }
}