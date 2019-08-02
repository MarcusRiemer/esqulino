import { Component, Input, OnInit } from '@angular/core';

import { UserService } from './user.service';
import { AvailableProvidersDescription } from './provider.description';
import { ServerApiService } from '../serverdata';

@Component({
  selector: 'provider-button',
  templateUrl: './templates/provider-button.html'
})
export class ProviderButtonComponent implements OnInit {
  @Input() providerName: string;

  constructor(
    private _serverApi: ServerApiService,
    private _userService: UserService
  ) { }

  public provider: AvailableProvidersDescription;

  public ngOnInit(): void {
    this._userService.providerList$.value.subscribe(a => {
      this.provider = a.find(v =>
        v.name.toLowerCase() === this.providerName.toLowerCase()
      )
    })
  }

  public onSignIn(provider: string) {
    window.location.href = this._serverApi.getSignInUrl(provider);
  }
}