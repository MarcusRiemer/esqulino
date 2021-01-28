import { EventEmitter } from "@angular/core";
import { Component, Input, Output } from "@angular/core";

import { LoginProviderDescription } from "./provider.description";
import { ServerApiService } from "../serverdata";
@Component({
  selector: "provider-button",
  templateUrl: "./templates/provider-button.html",
})
export class ProviderButtonComponent {
  @Input() provider: LoginProviderDescription;
  @Output() trigger = new EventEmitter<void>();

  constructor(private _serverApi: ServerApiService) {}

  /**
   * When the button is clicked this function will be triggerd.
   * Every external provider will change the location. The button for
   * the Blattwerkzeug provider triggers a new event.
   */
  public onClick() {
    if (this.provider.urlName) {
      window.location.href = this._serverApi.getSignInUrl(
        this.provider.urlName
      );
    } else this.trigger.emit();
  }
}
