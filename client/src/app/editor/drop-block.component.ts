import { Component, InjectionToken, Injector, Inject } from '@angular/core';

import { PortalInjector, ComponentPortal } from '@angular/cdk/portal';

import { NodeDescription, Node, Tree } from '../shared/syntaxtree';

import { CurrentCodeResourceService } from './current-coderesource.service';

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
    @Inject(DROP_BLOCK_DATA) private _dropBlockData: DropBlockData,
    private _currentCodeResource: CurrentCodeResourceService
  ) {
  }

  readonly codeResource = this._currentCodeResource.peekResource;

  readonly draggedTree = new Tree(this._dropBlockData.desc);

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
