import { Component, Input, OnInit } from "@angular/core";
import { UserService } from "./auth/user.service";

import { MayPerformRequestDescription } from "./may-perform.description";

@Component({
  selector: "may-perform",
  templateUrl: "./templates/may-perform.html",
})
export class MayPerformComponent implements OnInit {
  @Input() payload: MayPerformRequestDescription;

  constructor(private _userService: UserService) {}

  private _mayPerform: boolean;

  public get mayPerform(): boolean {
    return this._mayPerform;
  }

  public set mayPerform(mayPerform: boolean) {
    this._mayPerform = mayPerform;
  }

  public ngOnInit(): void {
    // When a button needs no permission, payload will be undefined
    if (this.payload) {
      this._userService.mayPerform$(this.payload).subscribe(
        (w) => (this.mayPerform = w.perform),
        (_) => console.log("Unauthorized may-perform")
      );
    } else {
      this.mayPerform = true;
    }
  }
}
