import { EventEmitter } from '@angular/core';
import { Component, Input, Output } from '@angular/core';

import { UserService } from './user.service';
import { AvailableProvidersDescription } from './provider.description';
import { ServerApiService } from '../serverdata';

@Component({
  selector: 'provider-button',
  templateUrl: './templates/provider-button.html'
})
export class ProviderButtonComponent {
  @Input() provider: AvailableProvidersDescription;
  @Output() trigger = new EventEmitter<void>()

  constructor(
    private _serverApi: ServerApiService,
    private _userService: UserService
  ) { }

  public onClick() {
    if (this.provider.urlName) {
      window.location.href = this._serverApi.getSignInUrl(this.provider.urlName);
    } else {
      this.trigger.emit();
    }
  }
}