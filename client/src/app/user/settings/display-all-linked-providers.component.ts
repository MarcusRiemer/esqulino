import { Component } from "@angular/core";

import { UserService } from "../../shared/auth/user.service";

@Component({
  selector: "display-all-linked-providers",
  templateUrl: "./display-all-linked-providers.component.html",
})
export class DisplayAllLinkedProvidersComponent {
  constructor(private _userService: UserService) {}

  // Current primary e-mail
  public primary: string;

  // All linked identities
  public providers$ = this._userService.providers$;
}
