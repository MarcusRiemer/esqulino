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
    this._userService.mayPerform$(this.payload).subscribe(
      w => this.mayPerform = w[this._userService.performIndex-1].perform,
      err => console.log(err),
      () => this._userService.resetPerformIndex()
    );
  }
}