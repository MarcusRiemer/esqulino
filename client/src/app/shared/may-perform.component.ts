import { Component, Input, OnInit } from "@angular/core";
import { UserService } from './auth/user.service';

import { PerformDescription } from './may-perform.description';

@Component({
  selector: "may-perform",
  templateUrl: "./templates/may-perform.html"
})
export class MayPerformComponent implements OnInit {
  @Input() payload: PerformDescription;

  constructor(
    private _userService: UserService
  ) {}

  public mayPerform: boolean;

  public ngOnInit(): void {
    // When a button needs no permission, payload will be undefined
    if (this.payload) {
      this._userService.mayPerform$(this.payload).subscribe(
        w => this.mayPerform = w[this._userService.performIndex-1].perform,
        _ => console.log("Unauthorized may-perform"),
        () => this._userService.resetPerformIndex()
      );
    } else { this.mayPerform = true; }
  }
}