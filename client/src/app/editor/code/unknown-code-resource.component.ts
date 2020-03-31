import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { map } from "rxjs/operators";

@Component({
  templateUrl: "templates/unknown-code-resource.html",
})
export class UnknownCodeResourceComponent {
  constructor(private _activatedRoute: ActivatedRoute) {}

  readonly resourceId = this._activatedRoute.params.pipe(
    map((params) => params["resourceId"])
  );
}
