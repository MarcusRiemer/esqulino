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
@Injectable()
export class PreferencesService {

  // The side navigation is visible by default.
  private _showSideNav = new BehaviorSubject(true);

  /**
   * @return Whether the side navigation should currently be visible.
   */
  get showSideNav(): Observable<boolean> {
    return (this._showSideNav);
  }

  /**
   * Toggles the display of the side navigation.
   */
  toggleSideNav() {
    this._showSideNav.next(!this._showSideNav.value);
  }

  /**
   * @return Whether developer debug information should be visible.
   */
  get showJsonModel(): Observable<boolean> {
    return (of(false));
  }
}
