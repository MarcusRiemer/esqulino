import { LOCALE_ID, Inject } from "@angular/core";
import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { NavItem } from "./nav-interfaces";

@Component({
  templateUrl: "./templates/nav-page.html",
})
export class NavSiteComponent {
  constructor(
    @Inject(LOCALE_ID) private readonly _localeId: string,
    private readonly _route: ActivatedRoute
  ) {}

  // The actual locale that is currently in use
  readonly locale = this._localeId;

  readonly navItemData: Observable<NavItem[]> = this._route.data.pipe(
    map((data) => data.items)
  );
}
