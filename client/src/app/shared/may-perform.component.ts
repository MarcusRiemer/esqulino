import { Component, Input, OnInit } from "@angular/core";
import { UserService } from './auth/user.service';

import { MayPerformRequestDescription } from './may-perform.description';

@Component({
  selector: "may-perform",
  templateUrl: "./templates/may-perform.html"
})
export class MayPerformComponent implements OnInit {
  @Input() payload: MayPerformRequestDescription;

  constructor(
    private _userService: UserService
  ) { }

  public mayPerform: boolean;

  public ngOnInit(): void {
    // When a button needs no permission, payload will be undefined
    if (this.payload) {
      this._userService.mayPerform$(this.payload).subscribe(
        w => this.mayPerform = w.perform,
        _ => console.log("Unauthorized may-perform"),
        () => this._userService.resetPerformIndex()
      );
    } else { this.mayPerform = true; }
  }
}