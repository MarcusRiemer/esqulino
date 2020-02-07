import { Component, Input } from '@angular/core';

import { ProviderDescription } from './auth/provider.description';

@Component({
  selector: 'provider-show',
  templateUrl: './templates/provider-show.html'
})
export class ProviderShowComponent {
  @Input() provider: ProviderDescription;

  constructor() { }
}