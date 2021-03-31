import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { map } from "rxjs/operators";
import { Observable } from "rxjs";

import { CurrentLocaleService } from "../current-locale.service";

import { NavItem } from "./nav-interfaces";

@Component({
  templateUrl: "./templates/nav-page.html",
})
export class NavSiteComponent {
  constructor(
    private readonly _lang: CurrentLocaleService,
    private readonly _route: ActivatedRoute
  ) {}

  // The actual locale that is currently in use
  readonly locale = this._lang;

  readonly navItemData: Observable<NavItem[]> = this._route.data.pipe(
    map((data) => data.items)
  );
}
