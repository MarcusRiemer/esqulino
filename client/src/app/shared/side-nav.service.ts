import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { NavItem } from './nav-interfaces';


@Injectable({
  providedIn: 'root'
})
export class SideNavService {
  private _sideNavItems = new Subject<NavItem[]>()
  private  _sideNavToggle = new Subject<void>();

  constructor() {}

  public newSideNav(list: NavItem[]): void {
    this._sideNavItems.next(list);
  }

  public toggleSideNav(): void {
    console.log("Shared-Sidenav: toggled");
    this._sideNavToggle.next();
  }

  public sideNavToggle$(): Observable<void> {
    return this._sideNavToggle.asObservable()
  }

  public sideNavItems$(): Observable<NavItem[]> {
    return this._sideNavItems.asObservable();
  }

}