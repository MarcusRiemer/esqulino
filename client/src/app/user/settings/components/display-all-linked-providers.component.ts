import { Component, OnInit, OnDestroy } from "@angular/core";

import { ProviderDescription } from '../../../shared/auth/provider.description';
import { UserService } from '../../../shared/auth/user.service';
@Component({
  selector: "display-all-linked-providers",
  templateUrl: "./templates/display-all-linked-providers.html"
})
export class DisplayAllLinkedProvidersComponent {
  constructor(
    private _userService: UserService,
  ) {}

  public primary: string;
  public providers$ = this._userService.providers$;

  public onDeleteIdentity(identity: ProviderDescription): void {
    this._userService.deleteEmail$(identity.id)
      .subscribe();
  }
}