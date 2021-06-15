import { Injectable } from "@angular/core";
import { Subject, Observable, BehaviorSubject } from "rxjs";

import { NavItem } from "./nav-interfaces";

@Injectable({
  providedIn: "root",
})
export class SideNavService {
  private readonly _sideNavItems$ = new BehaviorSubject<NavItem[]>([]);
  private readonly _sideNavToggle$ = new Subject<void>();

  constructor() {}

  public newSideNav(list: NavItem[]): void {
    console.log("Shared-Sidenav: New items", list);
    this._sideNavItems$.next(list);
  }

  public toggleSideNav(): void {
    console.log("Shared-Sidenav: toggled");
    this._sideNavToggle$.next();
  }

  public sideNavToggle$(): Observable<void> {
    return this._sideNavToggle$.asObservable();
  }

  readonly sideNavItems$ = this._sideNavItems$.asObservable();
}
