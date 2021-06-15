import { Component } from "@angular/core";

import { UserService } from "../../shared/auth/user.service";

@Component({
  selector: "user-details",
  templateUrl: "./user-details.component.html",
  styleUrls: ["./user-details.component.scss"],
})
export class UserDetailsComponent {
  constructor(private readonly _userService: UserService) {}

  readonly userId$ = this._userService.userId$;

  readonly roles$ = this._userService.roles$;
}
