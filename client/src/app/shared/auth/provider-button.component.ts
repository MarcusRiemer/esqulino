import { EventEmitter } from '@angular/core';
import { Component, Input, Output } from '@angular/core';

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
    private _serverApi: ServerApiService
  ) { }

  public onClick() {
    this.provider.urlName
      ? window.location.href = this._serverApi.getSignInUrl(this.provider.urlName)
      : this.trigger.emit()
      ;
  }
}