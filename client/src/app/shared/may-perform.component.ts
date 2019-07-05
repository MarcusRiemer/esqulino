import { PerformDataService } from './serverdata/perform-data.service';
import { Component, Input, OnInit } from "@angular/core";
import { UserService } from './auth/user.service';

import { PerformDescription } from './may-perform.description';

@Component({
  selector: "may-perform",
  templateUrl: "./templates/may-perform.html"
})
export class MayPerformComponent implements OnInit {
  @Input() payload: PerformDescription[];

  constructor(
    private _userService: UserService,
    private _performService: PerformDataService
  ) {}

  public mayPerform: boolean;

  public ngOnInit(): void {
    this._userService.mayPerform$(this.payload).subscribe(
      w => this.mayPerform = w.perform
    );
    this._performService.performRequest.next(this._userService.mayPerform$(this.payload))
    this._performService.pipedRequest.subscribe(values => console.log(values))
    this._performService.performRequest.next(this._userService.mayPerform$(this.payload))
  }
}