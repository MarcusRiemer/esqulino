import { Component } from '@angular/core';

import { providers } from './providers';
import { ServerApiService } from '../serverdata';

@Component({
  selector: 'provider-auth',
  templateUrl: './templates/provider-auth.html'
})
export class ProviderAuthComponent {
  constructor(
    private _serverApi: ServerApiService
  ) {}

  public readonly providers = providers;

  public onSignIn(provider: string) {
    window.location.href = this._serverApi.getSignInUrl(provider);
  }
}