import { Component, InjectionToken, Injector, Inject } from '@angular/core';

import { NodeDescription } from '../shared/syntaxtree';
import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';

export interface DropBlockData {
  desc: NodeDescription
}

export const DROP_BLOCK_DATA = new InjectionToken<{}>('DROP_BLOCK_DATA');

@Component({
  templateUrl: 'templates/drop-block.html',
  selector: `drop-block`
})
export class DropBlockComponent {

  constructor(
    @Inject(DROP_BLOCK_DATA) private _dropBlockData: DropBlockData
  ) {
  }

  readonly name = this._dropBlockData.desc.name;

  public static createPortalComponent(desc: NodeDescription, parentInjector: Injector) {
    // Build an injector that provides the relevant data for the component
    const injectorTokens = new WeakMap();
    const data: DropBlockData = {
      desc: desc
    };
    injectorTokens.set(DROP_BLOCK_DATA, data);
    const injector = new PortalInjector(parentInjector, injectorTokens);

    return (new ComponentPortal(DropBlockComponent, null, injector));
  }

}
