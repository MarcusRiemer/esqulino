import { Component } from '@angular/core';

import { providers } from '../../../shared/auth/providers';

@Component({
  selector: "provider-linking",
  templateUrl: "../templates/link-provider.html"
})
export class ProviderLinkingComponent {
  constructor() {}
  public readonly providers = providers;
}