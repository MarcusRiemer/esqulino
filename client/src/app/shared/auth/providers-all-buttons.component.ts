import { Component } from "@angular/core";

import { providers } from './providers';

@Component({
  selector: "providers-all-buttons",
  templateUrl: "./templates/providers-all-buttons.html"
})
export class ProvidersAllButtonsComponent {
  public readonly providers = providers
}
