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

  // Per default the navbar is left and the sidebar is right.
  private _paneOrder = new BehaviorSubject({
    navbar: 0,
    sidebar: 2,
    content: 1
  });

  // The side navigation is visible by default.
  private _showSideNav = new BehaviorSubject(true);

  /**
   * @return The current order the sidepanes should appear in. 
   */
  get paneOrder(): Observable<PaneOrder> {
    return (this._paneOrder);
  }

  /**
   * @return Whether the side navigation should currently be visible.
   */
  get showSideNav(): Observable<boolean> {
    return (this._showSideNav);
  }

  /**
   * @return Whether developer debug information should be visible.
   */
  get showJsonModel(): Observable<boolean> {
    return (of(false));
  }
}
