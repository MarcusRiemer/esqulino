import { Component } from "@angular/core";

import { ServerDataService } from "../shared";
import { first } from "rxjs/operators";

@Component({
  selector: "change-roles",
  templateUrl: "./templates/change-roles.html",
})
export class ChangeRoles {
  constructor(private _serverData: ServerDataService) {}

  public userId: string;

  public changeRoles(): void {
    this._serverData
      .changeRoles$(this.userId)
      .pipe(first())
      .subscribe(
        (_) => {
          console.log("Roles changed");
        },
        (err) => alert(JSON.stringify(err["error"]))
      );
  }
}
