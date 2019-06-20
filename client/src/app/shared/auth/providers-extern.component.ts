import { Component } from "@angular/core";

import { providers } from './providers';

@Component({
  selector: "providers-extern",
  templateUrl: "./templates/providers-extern.html"
})
export class ProvidersExternComponent {
  public readonly providers = providers
}
