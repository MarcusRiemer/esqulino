import { Observable, BehaviorSubject, of } from 'rxjs'

import { Injectable } from '@angular/core'

/**
 * The order the sidepanes should appear in.
 */
export interface PaneOrder {
  navbar: number,
  sidebar: number,
  content: number
}

/**
 * Allows access to user preferences. This mainly allows customization
 * of UI-related features.
 */
@Injectable({ providedIn: "root" })
export class PreferencesService {

  // The side is normally not visible on mobile devices
  private _showSideNav = new BehaviorSubject(true);

  readonly showSideNav$ = this._showSideNav.asObservable();

  /**
   * Toggles the display of the side navigation.
   */
  toggleSideNav() {
    this._showSideNav.next(!this._showSideNav.value);
  }

  setShowSideNav(val: boolean) {
    this._showSideNav.next(val);
  }

  /**
   * @return Whether developer debug information should be visible.
   */
  get showJsonModel(): Observable<boolean> {
    return (of(false));
  }
}
