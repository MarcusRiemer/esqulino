import { ClientProviderDescription } from './provider.description';
import { Component, Input, AfterViewInit, OnInit } from '@angular/core';

import { providers } from './providers';
import { ServerApiService } from '../serverdata';

@Component({
  selector: 'provider-button',
  templateUrl: './templates/provider-button.html'
})
export class ProviderButtonComponent implements OnInit {
  @Input() providers = providers;
  @Input() providerName: string;

  constructor(
    private _serverApi: ServerApiService
  ) {}

  public provider: ClientProviderDescription;

  public ngOnInit(): void {
    this.providers.forEach(e => {
      if (e.name.toLowerCase() === this.providerName.toLowerCase()) {
        this.provider = e;
      }
    })
  }

  public onSignIn(provider: string) {
    window.location.href = this._serverApi.getSignInUrl(provider);
  }
}