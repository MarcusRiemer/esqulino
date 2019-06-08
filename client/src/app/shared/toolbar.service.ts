import { Injectable, TemplateRef } from '@angular/core'
import { Router, NavigationStart } from '@angular/router'
import { TemplatePortal, Portal } from '@angular/cdk/portal'

import { BehaviorSubject, Subject } from 'rxjs'

/**
 * Controls which items should be shown on the toolbar.
 */
@Injectable()
export class ToolbarService {
  // Backing storage for items to show
  private _itemsPortal = new BehaviorSubject<Portal<any>[]>([]);

  constructor(
    router: Router
  ) {
    router.events.subscribe(routerEvent => {
      if (routerEvent instanceof NavigationStart) {
        this.clearItems();
      }
    });
  }

  public sideNav$ = new Subject<void>();

  /**
   * @return The portal that should be rendered
   */
  get itemsPortal() {
    return (this._itemsPortal.asObservable());
  }

  /**
   * Indicate that a new set of components should be shown.
   */
  addItem(templateRef: TemplateRef<any>) {
    const newItem = new TemplatePortal(templateRef, undefined, {});
    const currentItems = this._itemsPortal.value;
    this._itemsPortal.next(currentItems.concat(newItem));
  }

  /**
   * Indicates that no components should be shown at all.
   */
  clearItems() {
    this._itemsPortal.next([]);
  }
}
