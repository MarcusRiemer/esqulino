import { Component } from '@angular/core';

import { UserService } from '../../../shared/auth/user.service';
import { providers } from '../../../shared/auth/providers';
import { UserNameDescription } from './../../../shared/auth/user.description';
import { ProviderDescription, ServerProviderDescription } from '../../../shared/auth/provider.description';
import { first } from 'rxjs/operators';

@Component({
  templateUrl: '../templates/account-settings.html'
})
export class AccountSettingsComponent {
  constructor(
    private _userService: UserService,
  ) {
    this._userService.identities$.value.pipe(
      first()
    ).subscribe(
      identities => this.identities = identities
    )
  }

  public providers = providers;
  public identities: ServerProviderDescription;

  private anotherProviderWithSameEmail(identity: ProviderDescription): boolean {
    return this.identities.providers.some(v =>
      v.email === identity.email && v.type !== identity.type
    )
  }

  

}