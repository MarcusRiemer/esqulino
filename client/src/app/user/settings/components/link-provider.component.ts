import { Component, EventEmitter, Output } from '@angular/core';

import { UserService } from './../../../shared/auth/user.service';
@Component({
  selector: "provider-linking",
  templateUrl: "./templates/link-provider.html"
})
export class ProviderLinkingComponent {
  @Output() trigger = new EventEmitter<void>();

  constructor(
    private _userService: UserService
  ) { }
  public readonly providers = this._userService.providerList$;

  public onTrigger(): void {
    this.trigger.emit()
  }
}