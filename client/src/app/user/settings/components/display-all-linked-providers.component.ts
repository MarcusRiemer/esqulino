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

  // Current primary e-mail
  public primary: string;
  
  // All linked identities 
  public providers$ = this._userService.providers$;

  /**
   * Deleting a linked identity
   */
  public onDeleteIdentity(identity: ProviderDescription): void {
    this._userService.deleteIdentity$(identity.id)
      .subscribe();
  }
}